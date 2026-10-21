import { characters, openingFor } from "../data/dialogues";
import { get, key, observe } from "../data/locations";
import { act } from "./game";
import type { ConversationMemory, GameState } from "../types";

export interface DialogueChoice {
  id: string;
  label: string;
  detail?: string;
  paid?: boolean;
  utterance?: string;
}
function available(s: GameState, pointId: string) {
  return (
    s.status === "playing" &&
    s.pending === null &&
    get(s.tiles[s.position]).points.some(
      (p) => p.id === pointId && p.kind === "talk",
    ) &&
    characters[key(s.position, pointId)]
  );
}
function append(m: ConversationMemory, role: "npc" | "player", text: string) {
  m.history.push({ role, text });
  m.history = m.history.slice(-12);
}
export function beginConversation(s: GameState, pointId: string) {
  if (!available(s, pointId)) return false;
  const id = key(s.position, pointId);
  s.conversations ??= {};
  const existing = s.conversations[id];
  if (existing && existing.node !== "end") return true;
  const m: ConversationMemory = existing ?? {
    node: "menu",
    revision: 0,
    topics: [],
    history: [],
    notice: "",
  };
  m.node = "menu";
  m.notice = "";
  m.revision++;
  append(m, "npc", openingFor(s, id, !!existing));
  s.conversations[id] = m;
  return true;
}
export function conversationView(s: GameState, pointId: string) {
  const id = key(s.position, pointId),
    character = characters[id],
    memory = s.conversations?.[id];
  if (!character || !memory) return null;
  const choices: DialogueChoice[] = [];
  if (memory.node === "menu") {
    if (id === "0:mara")
      choices.push({
        id: "buy",
        label: "买四份补给",
        detail: "支付 3 金币 · 获得 4 补给",
        paid: true,
        utterance: "我买四份补给。",
      });
    character.topics.forEach(([label], i) =>
      choices.push({
        id: `topic${i}`,
        label,
        detail: memory.topics.includes(i) ? "已聊过 · 可重听" : undefined,
      }),
    );
  } else if (memory.node !== "end") {
    choices.push({
      id: "menu",
      label: id === "0:mara" ? "再看看补给与回程" : "我还想问一件事",
      utterance:
        id === "0:mara" ? "我再看看补给，也想问问回程。" : "我还想问一件事。",
    });
  }
  if (memory.node !== "end") choices.push({ id: "leave", label: "先聊到这里" });
  return {
    id,
    character,
    memory,
    choices,
    reply: memory.history.at(-1)?.text ?? "",
  };
}
export function chooseDialogue(
  s: GameState,
  pointId: string,
  choiceId: string,
  revision: number,
) {
  if (!available(s, pointId))
    return { ok: false, message: "现在无法交谈，请先处理当前遭遇。" };
  const view = conversationView(s, pointId);
  if (!view || view.memory.revision !== revision)
    return { ok: false, message: "这段对话已更新，请选择当前选项。" };
  const choice = view.choices.find((c) => c.id === choiceId);
  if (!choice) return { ok: false, message: "请选择当前对话中的选项。" };
  const { memory: m, character: c, id } = view;
  // Preserve a receipt from saves made before turn-level notices were added.
  const previousTurn = m.history.at(-1);
  if (previousTurn && m.notice && previousTurn.notice === undefined)
    previousTurn.notice = m.notice;
  m.revision++;
  m.notice = "";
  append(m, "player", choice.utterance ?? choice.label);
  if (choiceId === "leave") {
    m.node = "end";
    append(m, "npc", c.goodbye);
  } else if (choiceId === "menu") {
    m.node = "menu";
    append(m, "npc", c.followUp);
  } else if (choiceId === "buy") {
    const result = act(s, "buy");
    if (result.ok) {
      m.node = "receipt";
      m.notice = "交易完成：金币 −3 · 补给 +4。";
      append(m, "npc", "四份干粮，收好了。还要补给，还是问问回程？");
    } else {
      m.notice = `还差 ${Math.max(0, 3 - s.gold)} 金币，未扣款。可以先问回程，或结束交谈。`;
      append(m, "npc", "这点钱还不够四份。要不要先聊聊怎么留足回程的干粮？");
    }
  } else {
    const index = Number(choiceId.slice(-1));
    m.node = index === 0 ? "topic0" : "topic1";
    if (!m.topics.includes(index)) m.topics.push(index);
    if (index === 0) {
      const found = observe(s, pointId);
      if (found.ok && found.fresh && found.point.clue)
        m.notice = `线索已记录：${found.point.clue}`;
    }
    append(m, "npc", c.topics[index][1]);
  }
  // Keep receipts attached to their original turn when later replies arrive.
  const lastTurn = m.history.at(-1);
  if (lastTurn && m.notice) lastTurn.notice = m.notice;
  return { ok: true, message: m.notice };
}
