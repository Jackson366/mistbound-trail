import {
  characters,
  dialogueContext,
  openingFor,
  topicReply,
} from "../data/dialogues";
import { get, key, observe } from "../data/locations";
import { act, log } from "./game";
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
  const context = dialogueContext(s, id);
  if (
    existing &&
    existing.node !== "end" &&
    (existing.context === undefined || existing.context === context)
  ) {
    existing.context = context;
    return true;
  }
  const m: ConversationMemory = existing ?? {
    node: "menu",
    revision: 0,
    topics: [],
    history: [],
    notice: "",
  };
  m.node = "menu";
  m.context = context;
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
  if (memory.node !== "end" && s.status === "playing") {
    if (id === "0:cartographer" && s.sigils === 3)
      choices.push({
        id: "handover",
        label: "向奥伦交还星盘，完成远征",
        utterance: "三枚印记都在这里。我们把归路补全吧。",
      });
    if (id === "16:scholar" && s.letterStage === "heard")
      choices.push({
        id: "letter",
        label: "信使还留着那封星纹信",
        utterance: "酒馆里有封没寄出的信，落款只有星纹。是你写的吗？",
      });
    if (id === "0:courier" && s.letterStage === "carrying")
      choices.push({
        id: "deliver",
        label: "转达维恩的归乡口信",
        utterance: "维恩说，归途的星位已经找到了。他会回来，请你替他留一盏灯。",
      });
    if (id === "0:mara" && memory.node === "menu")
      choices.push({
        id: "buy",
        label: "买四份补给",
        detail: "支付 3 金币 · 获得 4 补给",
        paid: true,
        utterance: "我买四份补给。",
      });
    if (id === "0:mara" && memory.node !== "menu") {
      choices.push({
        id: "menu",
        label: "再看看补给与回程",
        utterance: "我再看看补给，也想问问回程。",
      });
    } else {
      const topics = character.topics
        .map(([label], i) => ({
          id: `topic${i}`,
          label,
          detail: memory.topics.includes(i) ? "已聊过 · 可重听" : undefined,
        }))
        .filter((topic) => topic.id !== memory.node);
      choices.push(...topics.slice(0, 2 - choices.length));
    }
    choices.push({ id: "leave", label: "先聊到这里" });
  }
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
  } else if (choiceId === "handover") {
    const result = act(s, "finish");
    if (!result.ok) return result;
    m.node = "end";
    m.notice = result.message;
    append(
      m,
      "npc",
      "这一次，地图终于有了终点。你带回的不只是三处星光，还有通往家门的路。",
    );
  } else if (choiceId === "letter") {
    s.letterStage = "carrying";
    m.node = "story";
    m.notice = log(
      s,
      "维恩托你给信使带话：归途的星位已经找到，他会回村，请替他留灯。",
    );
    append(
      m,
      "npc",
      "他还留着？那是我答应回去的日子。替我告诉他：归途的星位已经找到了，我会回村。这次，请他替我留灯。",
    );
  } else if (choiceId === "deliver") {
    s.letterStage = "delivered";
    m.node = "story";
    m.notice = log(
      s,
      "你把维恩的口信带给信使。未寄出的信终于收起，村门将多一盏归人的灯。",
    );
    append(
      m,
      "npc",
      "他总算肯说回来了。信不必再寄了……谢谢你。今夜我会在门外添一盏灯。",
    );
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
    if (id === "0:courier" && index === 1 && s.letterStage === undefined) {
      s.letterStage = "heard";
      m.notice = log(s, "信使留着一封没有寄出的星纹信。可以到孤塔向维恩问起。");
    }
    m.node = index === 0 ? "topic0" : "topic1";
    if (!m.topics.includes(index)) m.topics.push(index);
    if (index === 0) {
      const found = observe(s, pointId);
      if (found.ok && found.fresh && found.point.clue)
        m.notice = `线索已记录：${found.point.clue}`;
    }
    append(m, "npc", topicReply(s, id, index));
  }
  m.context = dialogueContext(s, id);
  // Keep receipts attached to their original turn when later replies arrive.
  const lastTurn = m.history.at(-1);
  if (lastTurn && m.notice) lastTurn.notice = m.notice;
  return { ok: true, message: m.notice };
}
