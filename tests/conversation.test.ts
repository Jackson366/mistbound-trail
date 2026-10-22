import { test } from "node:test";
import assert from "node:assert/strict";
import { create, validate } from "../src/engine/game";
import {
  beginConversation,
  chooseDialogue,
  conversationView,
} from "../src/engine/conversation";
import { characters } from "../src/data/dialogues";
import { createGameController } from "../src/composables/useGame";
import { SAVE_KEY } from "../src/engine/storage";
import type { GameState } from "../src/types";

function choose(s: GameState, point: string, id: string) {
  return chooseDialogue(
    s,
    point,
    id,
    conversationView(s, point)!.memory.revision,
  );
}
test("all seven NPCs provide bounded choices and first-topic clues exactly once, at no resource cost", () => {
  for (const id of Object.keys(characters)) {
    const s = create(123),
      [tile, point] = id.split(":");
    s.position = Number(tile);
    const resources = [s.hp, s.food, s.gold, s.time, s.randomState];
    assert.ok(beginConversation(s, point));
    assert.equal(s.discoveries?.length, 0);
    assert.equal(conversationView(s, point)?.choices.length, 3);
    assert.ok(choose(s, point, "topic0").ok);
    const logs = s.logs.length;
    assert.deepEqual(s.discoveries, [id]);
    assert.ok(choose(s, point, id === "0:mara" ? "menu" : "topic1").ok);
    const afterOtherTopic = s.logs.length;
    assert.ok(choose(s, point, "topic0").ok);
    assert.equal(s.logs.length, afterOtherTopic);
    assert.ok(afterOtherTopic >= logs);
    assert.deepEqual([s.hp, s.food, s.gold, s.time, s.randomState], resources);
    assert.ok(validate(s));
  }
});
test("supply purchase uses engine prices, rejects stale clicks and requires reopening its menu to buy again", () => {
  const s = create(1);
  beginConversation(s, "mara");
  const revision = conversationView(s, "mara")!.memory.revision;
  assert.ok(chooseDialogue(s, "mara", "buy", revision).ok);
  assert.equal(s.gold, 15);
  assert.equal(s.food, 14);
  assert.equal(s.time, 0);
  const after = JSON.stringify(s);
  assert.equal(chooseDialogue(s, "mara", "buy", revision).ok, false);
  assert.equal(choose(s, "mara", "buy").ok, false);
  assert.equal(JSON.stringify(s), after);
  assert.ok(choose(s, "mara", "menu").ok);
  assert.ok(choose(s, "mara", "buy").ok);
  assert.equal(s.gold, 12);
  assert.equal(s.food, 18);
});
test("receipts stay on their original NPC turn after follow-up questions and reloading", () => {
  const s = create(33);
  beginConversation(s, "mara");
  choose(s, "mara", "buy");
  const receipt = s.conversations!["0:mara"].history.at(-1)!;
  assert.match(receipt.notice!, /金币 −3 · 补给 \+4/);
  // A previous version stored this receipt only on memory.notice.
  delete receipt.notice;
  assert.ok(validate(s));
  choose(s, "mara", "menu");
  choose(s, "mara", "topic0");
  const restored = JSON.parse(JSON.stringify(s)) as GameState;
  assert.ok(validate(restored));
  const history = restored.conversations!["0:mara"].history;
  assert.equal(history.filter((t) => t.notice?.includes("交易完成")).length, 1);
  assert.match(history.at(-1)!.notice!, /归途的补给/);
  history[0].notice = 500 as unknown as string;
  assert.equal(validate(restored), false);
});
test("insufficient gold explains the shortage, charges nothing and keeps a free topic and exit", () => {
  const s = create(2);
  s.gold = 1;
  beginConversation(s, "mara");
  choose(s, "mara", "buy");
  assert.equal(s.gold, 1);
  assert.equal(s.food, 10);
  assert.equal(s.time, 0);
  const view = conversationView(s, "mara")!;
  assert.match(view.memory.notice, /还差 2 金币，未扣款/);
  assert.ok(view.choices.some((c) => c.id === "topic0"));
  assert.ok(choose(s, "mara", "leave").ok);
  assert.equal(conversationView(s, "mara")!.choices.length, 0);
});
test("interrupted conversations resume exactly; explicit endings receive a short returning greeting", () => {
  const s = create(3);
  beginConversation(s, "cartographer");
  choose(s, "cartographer", "topic0");
  const before = JSON.stringify(s.conversations);
  beginConversation(s, "courier");
  const reloaded = JSON.parse(JSON.stringify(s)) as GameState;
  assert.ok(validate(reloaded));
  beginConversation(reloaded, "cartographer");
  assert.equal(
    JSON.stringify(reloaded.conversations!["0:cartographer"]),
    JSON.stringify(JSON.parse(before)["0:cartographer"]),
  );
  choose(reloaded, "cartographer", "leave");
  beginConversation(reloaded, "cartographer");
  assert.match(
    conversationView(reloaded, "cartographer")!.reply,
    /地图还在这里/,
  );
  for (let i = 0; i < 20; i++) {
    assert.ok(choose(reloaded, "cartographer", "topic0").ok);
    assert.ok(choose(reloaded, "cartographer", "topic1").ok);
  }
  assert.ok(reloaded.conversations!["0:cartographer"].history.length <= 12);
  assert.ok(validate(reloaded));
});
test("remote NPCs, pending encounters, ended expeditions and conflicting tabs cannot mutate dialogue", () => {
  const s = create(4);
  assert.equal(beginConversation(s, "scholar"), false);
  beginConversation(s, "mara");
  const revision = conversationView(s, "mara")!.memory.revision;
  s.position = 1;
  s.pending = 1;
  let before = JSON.stringify(s);
  assert.equal(beginConversation(s, "mara"), false);
  assert.equal(chooseDialogue(s, "mara", "buy", revision).ok, false);
  assert.equal(JSON.stringify(s), before);
  s.position = 0;
  s.pending = null;
  s.status = "lost";
  before = JSON.stringify(s);
  assert.equal(beginConversation(s, "mara"), false);
  assert.equal(chooseDialogue(s, "mara", "buy", revision).ok, false);
  assert.equal(JSON.stringify(s), before);
  const game = createGameController({ getItem: () => null, setItem: () => {} });
  game.observePoint("mara");
  game.storageChanged({ key: SAVE_KEY } as StorageEvent);
  before = JSON.stringify(game.state.value);
  game.chooseDialogue("buy", game.conversation.value!.memory.revision);
  assert.equal(JSON.stringify(game.state.value), before);
  game.dispose();
});
test("legacy saves load; malformed conversation memory is rejected", () => {
  const s = create(5);
  assert.ok(validate(s));
  beginConversation(s, "mara");
  assert.ok(validate(s));
  for (const patch of [
    { node: "unknown" },
    { node: "receipt", history: [] },
    { topics: [0, 0] },
    { revision: -1 },
    { history: [{ role: "system", text: "x" }] },
    { notice: 1 },
  ]) {
    const broken = structuredClone(s);
    Object.assign(broken.conversations!["0:mara"], patch);
    assert.equal(validate(broken), false);
  }
  const broken = structuredClone(s);
  broken.conversations!["99:fake"] = broken.conversations!["0:mara"];
  assert.equal(validate(broken), false);
});
test("greetings use visible village progress and empty provisions; other NPCs keep their own context", () => {
  const s = create(9);
  s.food = 0;
  beginConversation(s, "mara");
  assert.match(conversationView(s, "mara")!.reply, /干粮都空了/);
  const sigil = s.tiles.find((t) => t.sigil)!;
  sigil.searched = true;
  s.sigils = 1;
  beginConversation(s, "cartographer");
  assert.match(
    conversationView(s, "cartographer")!.reply,
    /1 枚印记.*还差 2 枚/,
  );
  beginConversation(s, "courier");
  assert.doesNotMatch(conversationView(s, "courier")!.reply, /枚印记|补给/);
  assert.ok(validate(s));
});
