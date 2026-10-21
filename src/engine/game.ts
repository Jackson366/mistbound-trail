import { validConversations } from "./conversation-memory";
import type {
  Action,
  ActionResult,
  Biome,
  Content,
  Coordinate,
  Feature,
  GameState,
  ResolveMode,
  Tile,
} from "../types";
export const directions: [number, number][] = [
  [1, 0],
  [0, 1],
  [-1, 1],
  [-1, 0],
  [0, -1],
  [1, -1],
];
export const biomeNames: Record<Biome, string> = {
  plain: "草原",
  forest: "森林",
  hill: "丘陵",
  marsh: "沼泽",
  mountain: "山地",
};
export const biomeDescriptions: Record<Biome, string> = {
  plain: "风掠过没膝的长草。石砌路标在暮色里指向无人的远方。",
  forest:
    "松针遮住了旧路，空气中有雨水与苔藓的气味。枝叶深处，似乎有什么正在等待。",
  hill: "起伏的山脊像沉睡巨兽的脊背。古老石墙穿过荒草，消失在雾中。",
  marsh: "浅水映着灰白的天空。芦苇轻响，一串脚印止步于水边。",
  mountain: "冷风从峭壁间穿过。残雪之下，一条早已被遗忘的小径仍然通向山中。",
};
export const featureNames: Record<Feature, string> = {
  landmark: "地标",
  settlement: "聚落",
  lair: "巢穴",
  dungeon: "地下遗迹",
  tower: "孤塔",
  abbey: "修道院",
  castle: "城堡",
};
export function distance(a: Coordinate, b: Coordinate): number {
  return Math.max(
    Math.abs(a.q - b.q),
    Math.abs(a.r - b.r),
    Math.abs(a.q + a.r - b.q - b.r),
  );
}
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function rollBiome(n: number): Biome {
  return n <= 4
    ? "plain"
    : n <= 6
      ? "forest"
      : n <= 8
        ? "hill"
        : n === 9
          ? "marsh"
          : "mountain";
}
export function generate(seed: number): Tile[] {
  const random = rng(seed),
    d = (n: number) => 1 + Math.floor(random() * n);
  const coords = [{ q: 0, r: 0 }];
  for (let radius = 1; radius <= 2; radius++) {
    let q = 0,
      r = -radius;
    for (const dir of directions)
      for (let s = 0; s < radius; s++) {
        coords.push({ q, r });
        q += dir[0];
        r += dir[1];
      }
  }
  let prior = rollBiome(d(10));
  const names = [
    "烛溪村",
    "灰松林",
    "风语草甸",
    "旧路驿站",
    "鹿角丘",
    "苔石溪",
    "守望松径",
    "沉星祭坛",
    "雾鸦荒原",
    "白枝修道院",
    "回声石阵",
    "断桥沼地",
    "旧王墓窟",
    "冷泉谷",
    "暮色关隘",
    "落羽林",
    "无灯孤塔",
    "风蚀山口",
    "野鹿营地",
  ];
  const tiles = coords.map((p, i): Tile => {
    const n = d(10);
    let biome = i === 0 ? prior : n <= 5 ? prior : rollBiome(n);
    prior = biome;
    const f = d(6);
    const feature =
      f <= 3
        ? "landmark"
        : f === 4
          ? "settlement"
          : f === 5
            ? "lair"
            : "dungeon";
    return {
      ...p,
      id: i,
      name: names[i],
      biome,
      feature,
      nature: d(6) <= 3 ? "自然" : "人工",
      content: (
        [
          "hazard",
          "empty",
          "empty",
          "special",
          "monster",
          "monster",
        ] as Content[]
      )[d(6) - 1],
      searched: false,
      visible: i < 7,
      visited: i === 0,
      sigil: false,
      faction: null,
    };
  });
  Object.assign(tiles[0], {
    biome: "plain",
    feature: "settlement",
    content: "camp",
  });
  Object.assign(tiles[1], {
    biome: "forest",
    feature: "landmark",
    content: "empty",
  });
  Object.assign(tiles[7], {
    feature: "landmark",
    nature: "魔法",
    content: "special",
    sigil: true,
  });
  Object.assign(tiles[9], { feature: "abbey", faction: "白枝修会" });
  Object.assign(tiles[12], {
    feature: "dungeon",
    content: "monster",
    sigil: true,
  });
  Object.assign(tiles[14], { feature: "castle", faction: "暮色守卫" });
  Object.assign(tiles[16], {
    feature: "tower",
    content: "hazard",
    sigil: true,
    faction: "无灯学者",
  });
  return tiles;
}
export function create(seed: number): GameState {
  return {
    version: 1,
    seed: seed >>> 0,
    randomState: (seed ^ 0xa5a5a5a5) >>> 0,
    tiles: generate(seed),
    position: 0,
    selected: 0,
    hp: 12,
    food: 10,
    gold: 18,
    sigils: 0,
    time: 0,
    status: "playing",
    pending: null,
    discoveries: [],
    logs: [
      { time: 0, locationId: 0, text: "抵达烛溪村。制图师托你寻回三枚印记。" },
    ],
  };
}
export function randomRoll(s: GameState): number {
  s.randomState = (Math.imul(1664525, s.randomState) + 1013904223) >>> 0;
  return 1 + Math.floor((s.randomState / 4294967296) * 6);
}
export function log(s: GameState, text: string): string {
  s.logs.unshift({ time: s.time, locationId: s.position, text });
  s.logs = s.logs.slice(0, 80);
  return text;
}
export function reveal(s: GameState): void {
  const c = s.tiles[s.position];
  for (const t of s.tiles) if (distance(t, c) <= 1) t.visible = true;
}
export function check(s: GameState): void {
  if (s.hp <= 0) {
    s.hp = 0;
    s.status = "lost";
    log(s, "你倒在迷雾中，远征就此结束。");
  } else if (s.position === 0 && s.sigils === 3) {
    s.status = "won";
    log(s, "三枚印记归位。星盘亮起，你带回了灰松谷的星光。");
  }
}
export function consume(s: GameState): void {
  if (s.food > 0) s.food--;
  else s.hp -= 2;
}
export function act(
  s: GameState,
  action: Action,
  arg?: number | ResolveMode,
): ActionResult {
  if (s.status !== "playing")
    return { ok: false, message: "这次远征已经结束，可以开启新旅程。" };
  const here = s.tiles[s.position];
  if (s.pending && action !== "resolve")
    return { ok: false, message: "先处理此地的遭遇，或稍后再决定。" };
  let message = "";
  if (action === "move") {
    const t = typeof arg === "number" ? s.tiles[arg] : undefined;
    if (!t || distance(here, t) !== 1)
      return { ok: false, message: "只能前往与你当前位置相邻的地块。" };
    s.time++;
    consume(s);
    s.position = t.id;
    s.selected = t.id;
    t.visited = true;
    reveal(s);
    message = log(
      s,
      `抵达${t.name}。${t.sigil && !t.searched ? "你察觉到一丝古代星光。" : "雾中的地貌渐渐清晰。"}`,
    );
  } else if (action === "explore") {
    if (here.id === 0 || here.searched)
      return { ok: false, message: "这里已经调查完毕，向新的地块出发吧。" };
    s.time++;
    if (here.sigil || here.content === "monster" || here.content === "hazard") {
      s.pending = here.id;
      message = log(
        s,
        `在${here.name}发现了${here.sigil ? "古代印记的线索" : "需要谨慎处理的遭遇"}。`,
      );
    } else {
      here.searched = true;
      if (here.content === "empty") {
        s.food += 2;
        message = log(
          s,
          `${here.name}没有危险。你找到干粮（补给 +2），石上刻痕指向旧祭坛、孤塔与墓窟。`,
        );
      } else {
        s.gold += 5;
        message = log(s, `调查${here.name}，找到旅人遗留的钱袋，金币 +5。`);
      }
    }
  } else if (action === "resolve") {
    if (s.pending !== here.id || !(arg === "bold" || arg === "careful"))
      return { ok: false, message: "当前没有待处理的遭遇。" };
    let die = null,
      damage = 0;
    if (arg === "careful") {
      s.time += 2;
      if (s.food > 0) s.food--;
      else damage = 2;
    } else {
      die = randomRoll(s);
      if (die < 4) damage = 3;
    }
    s.hp -= damage;
    here.searched = true;
    s.pending = null;
    if (here.sigil) {
      s.sigils++;
      s.gold += 4;
    } else {
      s.gold += 6;
    }
    message = log(
      s,
      `${arg === "bold" ? `掷出 ${die} 点` : "谨慎绕行"}，${here.sigil ? "取回一枚古代印记，金币 +4" : "取得遗留财物，金币 +6"}${damage ? `，生命 -${damage}` : "，平安无伤"}。`,
    );
    check(s);
    return { ok: true, message, die, damage };
  } else if (action === "rest") {
    if (s.hp === 12) return { ok: false, message: "生命已满，无需休整。" };
    if (here.id !== 0 && s.food < 1)
      return { ok: false, message: "野外休整需要 1 份补给。请返回村庄补给。" };
    s.time += 2;
    if (here.id === 0) s.hp = 12;
    else {
      s.food--;
      s.hp = Math.min(12, s.hp + 4);
    }
    message = log(
      s,
      here.id === 0
        ? "在村中安睡，生命恢复至 12。"
        : "扎营休整，补给 -1，恢复最多 4 点生命。",
    );
  } else if (action === "buy") {
    if (here.id !== 0 || s.gold < 3)
      return { ok: false, message: "在烛溪村花费 3 金币，可购买 4 份补给。" };
    s.gold -= 3;
    s.food += 4;
    message = log(s, "向村中商人购买干粮，金币 -3，补给 +4。");
  } else return { ok: false, message: "未识别的行动。" };
  check(s);
  return { ok: true, message };
}
export function validate(value: unknown): value is GameState {
  if (
    !value ||
    typeof value !== "object" ||
    !validConversations((value as GameState).conversations)
  )
    return false;
  if (!value || typeof value !== "object") return false;
  const s = value as GameState;
  if (
    !s ||
    s.version !== 1 ||
    !Number.isInteger(s.seed) ||
    s.seed < 0 ||
    s.seed > 4294967295 ||
    !Number.isInteger(s.randomState) ||
    s.randomState < 0 ||
    s.randomState > 4294967295
  )
    return false;
  if (
    !Array.isArray(s.tiles) ||
    s.tiles.length !== 19 ||
    !Array.isArray(s.logs) ||
    s.logs.length > 80
  )
    return false;
  for (const [key, max] of [
    ["position", 18],
    ["selected", 18],
    ["hp", 12],
    ["food", 100000],
    ["gold", 100000],
    ["sigils", 3],
    ["time", 100000],
  ] as const)
    if (!Number.isInteger(s[key]) || s[key] < 0 || s[key] > max) return false;
  if (
    !["playing", "won", "lost"].includes(s.status) ||
    !(
      s.pending === null ||
      (Number.isInteger(s.pending) && s.pending > 0 && s.pending < 19)
    )
  )
    return false;
  if (
    s.discoveries !== undefined &&
    (!Array.isArray(s.discoveries) ||
      s.discoveries.length > 80 ||
      new Set(s.discoveries).size !== s.discoveries.length ||
      s.discoveries.some(
        (k) =>
          typeof k !== "string" || !/^(?:[0-9]|1[0-8]):[a-z]{1,20}$/.test(k),
      ))
  )
    return false;
  const expected = generate(s.seed);
  return (
    s.tiles.every(
      (t, i) =>
        t &&
        t.id === i &&
        t.q === expected[i].q &&
        t.r === expected[i].r &&
        t.name === expected[i].name &&
        t.biome === expected[i].biome &&
        t.feature === expected[i].feature &&
        t.content === expected[i].content &&
        t.sigil === expected[i].sigil &&
        (["searched", "visible", "visited"] as const).every(
          (k) => typeof t[k] === "boolean",
        ),
    ) &&
    s.logs.every(
      (l) =>
        l &&
        Number.isInteger(l.time) &&
        typeof l.text === "string" &&
        l.text.length < 500,
    ) &&
    s.tiles.filter((t) => t.sigil && t.searched).length === s.sigils &&
    (s.pending === null ||
      (s.pending === s.position && !s.tiles[s.pending].searched))
  );
}
