import { characters } from "../data/dialogues";
import type { ConversationMemory } from "../types";

// Optional version-1 extension: legacy saves have no conversation memory.
export function validConversations(value: unknown): boolean {
  if (value === undefined) return true;
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const entries = Object.entries(value);
  return (
    entries.length <= 7 &&
    entries.every(([id, raw]) => {
      if (
        !Object.hasOwn(characters, id) ||
        !raw ||
        typeof raw !== "object" ||
        Array.isArray(raw)
      )
        return false;
      const m = raw as ConversationMemory;
      return (
        ["menu", "topic0", "topic1", "receipt", "story", "end"].includes(
          m.node,
        ) &&
        (m.context === undefined ||
          (typeof m.context === "string" && m.context.length < 100)) &&
        (m.node !== "receipt" || id === "0:mara") &&
        (m.node !== "topic1" || characters[id].topics.length > 1) &&
        Number.isInteger(m.revision) &&
        m.revision > 0 &&
        m.revision <= 1000000000 &&
        Array.isArray(m.topics) &&
        m.topics.length <= characters[id].topics.length &&
        new Set(m.topics).size === m.topics.length &&
        m.topics.every(
          (i) =>
            Number.isInteger(i) && i >= 0 && i < characters[id].topics.length,
        ) &&
        typeof m.notice === "string" &&
        m.notice.length < 500 &&
        Array.isArray(m.history) &&
        m.history.length > 0 &&
        m.history.length <= 12 &&
        m.history.at(-1)?.role === "npc" &&
        m.history.every(
          (t) =>
            t &&
            (t.role === "npc" || t.role === "player") &&
            typeof t.text === "string" &&
            t.text.length > 0 &&
            t.text.length < 500 &&
            (t.notice === undefined ||
              (typeof t.notice === "string" && t.notice.length < 500)),
        )
      );
    })
  );
}
