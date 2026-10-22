import type { GameState, Tile } from "../types";

interface LandmarkEncounter {
  title: string;
  intro: string;
  bold: string;
  careful: string;
  insight: string;
  time: number;
  gold: number;
  requirements: { label: string; keys: string[] }[];
  outcome: string;
  aftermath: [string, string];
}

// These are authored challenges, independent of random terrain and scenery.
export const landmarkEncounters: Record<number, LandmarkEncounter> = {
  7: {
    title: "祭坛 · 找到归乡的星位",
    intro:
      "星盘基座的凹槽可以转动。三道短纹朝向来路，中央的光正等待与你手中的星盘相合。",
    bold: "伸手取出星光",
    careful: "沿外圈避开裂隙",
    insight: "沿归乡刻痕对齐星盘",
    time: 0,
    gold: 0,
    requirements: [
      {
        label: "辨认归乡刻痕：松林树干或祭坛星文",
        keys: ["1:bark", "7:runes"],
      },
      { label: "查看祭坛中央的星盘基座", keys: ["7:center"] },
    ],
    outcome:
      "你让三道短纹朝向烛溪村。星盘与凹槽轻轻合拢，第一缕光自行落入掌心。你读懂的刻痕成了取回印记的方法。",
    aftermath: [
      "石盘已经安静下来，凹槽朝向你来时的路。这里的印记已收入行囊。",
      "你再看那句归乡的嘱托，才发现石盘留下的空位像一扇朝外的门。",
    ],
  },
  12: {
    title: "墓窟 · 守卫等待归还",
    intro:
      "拖剑声沿前厅来回移动。石像向门外托着空盘，送行浮雕上的人却都背向王冠。守卫似乎在等一个未完成的动作。",
    bold: "趁守卫转身穿过前厅",
    careful: "绕过守卫巡行的甬道",
    insight: "将一枚金币放回石像空盘",
    time: 1,
    gold: 1,
    requirements: [
      { label: "查看左壁的送行浮雕", keys: ["12:relief"] },
      { label: "理解石像空盘的归还姿态", keys: ["12:statue"] },
    ],
    outcome:
      "金币落在石盘上。你学着浮雕中村民的姿态，向门外退开一步。拖剑声停了，守卫为归还之人让出取回印记的路。",
    aftermath: [
      "星纹棺椁的光已经熄去。这里的印记已收入行囊，前厅又恢复了寂静。",
      "空盘依然朝向门外。离开时，你听见的只剩自己的脚步。",
    ],
  },
  16: {
    title: "孤塔 · 等待机关的间隙",
    intro:
      "星仪的传动轴每转三次就会停顿。书页上的字在月光之外浮现，底座的印记随着齿轮忽明忽暗。",
    bold: "趁齿轮转动取出印记",
    careful: "从破损阶梯绕到星仪背面",
    insight: "依照暗处的字等待第三转后的停顿",
    time: 2,
    gold: 0,
    requirements: [
      {
        label: "阅读无字书，或向维恩询问暗处墨迹",
        keys: ["16:shelf", "scholar:ink"],
      },
      { label: "查看中央的黄铜星仪", keys: ["16:orrery"] },
    ],
    outcome:
      "你把书页移出月光，数到第三转停顿时才伸手。齿轮重新咬合时，印记已经在你手中。星图上这一段航线，指向烛溪村的村灯。",
    aftermath: [
      "星仪仍在缓慢旋转，底座已经空了。这里的印记已收入行囊，机关不再阻挡你。",
      "维恩把三处星位连成一线。那条航线并不通向王座，终点是一盏熟悉的村灯。",
    ],
  },
};

function knows(s: GameState, key: string) {
  return key === "scholar:ink"
    ? !!s.conversations?.["16:scholar"]?.topics.includes(1)
    : !!s.discoveries?.includes(key);
}

export function encounterFor(s: GameState) {
  const tile = s.tiles[s.position];
  const landmark = landmarkEncounters[tile.id];
  if (!landmark) return null;
  const missing = landmark.requirements.filter(
    (r) => !r.keys.some((k) => knows(s, k)),
  );
  return {
    ...landmark,
    missing: missing.map((r) => r.label),
    canInsight: missing.length === 0 && s.gold >= landmark.gold,
    cost: [
      landmark.time ? `${landmark.time} 时段` : "不额外消耗时段",
      landmark.gold ? `${landmark.gold} 金币` : "不消耗物资",
    ].join(" · "),
  };
}

export function shelteredRest(s: GameState) {
  return (
    [1, 18].includes(s.position) &&
    (s.discoveries?.includes("1:scarf") ||
      s.conversations?.["18:hunter"]?.topics.includes(0))
  );
}

export function aftermathFor(tile: Tile) {
  return tile.searched ? landmarkEncounters[tile.id]?.aftermath : undefined;
}

export function endingFor(s: GameState) {
  const lines = [
    "你把三枚印记交给奥伦。星盘上的光连成一条路，终点正是烛溪村。玛拉把一碗热汤放到你面前。",
  ];
  const count = s.insightSites?.length ?? 0;
  if (count)
    lines.push(
      `有 ${count} 处古迹，是你凭观察与理解走过的。奥伦将这些方法添在地图边，留给下一位旅人。`,
    );
  else
    lines.push(
      "奥伦把你的足迹补在地图上。那些绕过的险处，也成了后来者可以参考的路。",
    );
  if (s.letterStage === "delivered")
    lines.push(
      "信使终于收起那封未寄出的信，向门外添了一盏灯：这一次，维恩答应回来。",
    );
  else if (s.letterStage === "carrying")
    lines.push(
      "你还记着维恩托付的口信。远征虽已结束，手记里仍留着一句没来得及转达的话。",
    );
  return lines;
}

export function letterNoteFor(s: GameState) {
  if (s.letterStage === "heard")
    return "未寄出的信：信使认得星纹，到无灯孤塔向维恩问起这封信。";
  if (s.letterStage === "carrying")
    return "待转达的口信：维恩会回村，请信使替他留灯。回烛溪村后与信使交谈。";
  if (s.letterStage === "delivered")
    return "口信已转达：信使收好了那封信，答应为维恩留灯。";
  return "";
}
