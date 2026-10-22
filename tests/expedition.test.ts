import { test } from "node:test";
import assert from "node:assert/strict";
import { act, create, validate } from "../src/engine/game";
import {
  beginConversation,
  chooseDialogue,
  conversationView,
} from "../src/engine/conversation";
import { encounterFor, endingFor, letterNoteFor } from "../src/data/expedition";
import { get, observe } from "../src/data/locations";
import { loadGame } from "../src/engine/storage";
import { createGameController } from "../src/composables/useGame";
import type { GameState } from "../src/types";

function choose(s: GameState, point: string, choice: string) {
  return chooseDialogue(
    s,
    point,
    choice,
    conversationView(s, point)!.memory.revision,
  );
}
function recovered(s: GameState, ids = [7, 12, 16]) {
  for (const id of ids) s.tiles[id].searched = true;
  s.sigils = ids.length;
}

test("all landmark insights require observed evidence, pay distinct costs once, and persist aftermath", () => {
  for (const [id, points, time, gold] of [
    [7, ["runes", "center"], 0, 0],
    [12, ["relief", "statue"], 1, 1],
    [16, ["shelf", "orrery"], 2, 0],
  ] as const) {
    const s = create(42);
    s.position = id;
    act(s, "explore");
    const pending = JSON.stringify(s);
    assert.equal(act(s, "resolve", "insight").ok, false);
    assert.equal(JSON.stringify(s), pending);
    assert.ok(act(s, "withdraw").ok);
    assert.equal(s.time, 1); // Withdrawing never refunds the first investigation.
    for (const point of points) assert.ok(observe(s, point).ok);
    assert.ok(act(s, "explore").ok);
    const before = {
      time: s.time,
      gold: s.gold,
      food: s.food,
      rng: s.randomState,
    };
    assert.ok(encounterFor(s)?.canInsight);
    assert.ok(act(s, "resolve", "insight").ok);
    assert.equal(s.time, before.time + time);
    assert.equal(s.gold, before.gold - gold + 4);
    assert.equal(s.food, before.food);
    assert.equal(s.hp, 12);
    assert.equal(s.randomState, before.rng);
    assert.deepEqual(s.insightSites, [id]);
    const completed = JSON.stringify(s);
    assert.equal(act(s, "resolve", "insight").ok, false);
    assert.equal(JSON.stringify(s), completed);
    const loaded = loadGame({ getItem: () => completed, setItem: () => {} });
    assert.equal(loaded.blocked, false);
    assert.match(get(loaded.state.tiles[id]).intro.join(""), /印记已收入行囊/);
    assert.equal(
      get(s.tiles[id]).points.find((p) => p.kind === "core")?.title,
      "印记已取回",
    );
  }
});

test("forest markings substitute for altar runes and bitter herbs improve only sheltered camps", () => {
  const s = create(9);
  act(s, "move", 1);
  observe(s, "bark");
  s.hp = 1;
  act(s, "rest");
  assert.equal(s.hp, 5);
  observe(s, "scarf");
  act(s, "rest");
  assert.equal(s.hp, 11);
  act(s, "move", 7);
  observe(s, "center");
  assert.ok(encounterFor(s)?.canInsight);
  assert.equal(act(s, "resolve", "insight").ok, false); // Investigation is still required.
  const t = create(10);
  t.discoveries = ["1:scarf"];
  t.position = 2;
  t.hp = 1;
  act(t, "rest");
  assert.equal(t.hp, 5);
});

test("tomb insight with insufficient gold preserves state and other encounter options", () => {
  const s = create(1);
  s.position = 12;
  observe(s, "relief");
  observe(s, "statue");
  s.gold = 0;
  act(s, "explore");
  const before = JSON.stringify(s);
  assert.equal(act(s, "resolve", "insight").ok, false);
  assert.equal(JSON.stringify(s), before);
  assert.ok(act(s, "resolve", "careful").ok);
});

test("scholar's dark-ink topic unlocks tower timing without reading the shelf", () => {
  const s = create(3);
  s.position = 16;
  beginConversation(s, "scholar");
  choose(s, "scholar", "topic1");
  observe(s, "orrery");
  assert.ok(encounterFor(s)?.canInsight);
  act(s, "explore");
  assert.ok(act(s, "resolve", "insight").ok);
});

test("unfinished Oren conversation responds to new recovered sites and directly continues topics", () => {
  const s = create(4);
  beginConversation(s, "cartographer");
  choose(s, "cartographer", "topic0");
  assert.ok(
    conversationView(s, "cartographer")!.choices.some((c) => c.id === "topic1"),
  );
  recovered(s, [7]);
  beginConversation(s, "cartographer");
  assert.match(conversationView(s, "cartographer")!.reply, /1 枚.*沉星祭坛/);
  choose(s, "cartographer", "topic0");
  const reply = conversationView(s, "cartographer")!.reply;
  assert.match(reply, /旧王墓窟、无灯孤塔/);
  assert.doesNotMatch(reply, /还要去沉星祭坛/);
});

test("courier-scholar-courier message is contextual, free, persistent and cannot repeat", () => {
  let s = create(5);
  const resources = [s.hp, s.food, s.gold, s.time];
  beginConversation(s, "courier");
  choose(s, "courier", "topic1");
  assert.equal(s.letterStage, "heard");
  assert.match(letterNoteFor(s), /无灯孤塔/);
  s.position = 16;
  beginConversation(s, "scholar");
  const oldRevision = conversationView(s, "scholar")!.memory.revision;
  assert.ok(choose(s, "scholar", "letter").ok);
  assert.equal(s.letterStage, "carrying");
  assert.match(letterNoteFor(s), /回烛溪村/);
  const before = JSON.stringify(s);
  assert.equal(chooseDialogue(s, "scholar", "letter", oldRevision).ok, false);
  assert.equal(JSON.stringify(s), before);
  s = loadGame({ getItem: () => JSON.stringify(s), setItem: () => {} }).state;
  s.position = 0;
  beginConversation(s, "courier");
  assert.match(conversationView(s, "courier")!.reply, /维恩/);
  assert.ok(choose(s, "courier", "deliver").ok);
  assert.equal(s.letterStage, "delivered");
  assert.equal(choose(s, "courier", "deliver").ok, false);
  assert.deepEqual([s.hp, s.food, s.gold, s.time], resources);
  assert.match(endingFor(s).join(""), /替他留灯|多一盏|添了一盏灯/);
  assert.ok(validate(s));
});

test("returning with all sigils permits welcome conversations and requires explicit handover", () => {
  const s = create(8);
  assert.equal(act(s, "finish").ok, false);
  recovered(s);
  s.position = 1;
  assert.equal(act(s, "finish").ok, false);
  act(s, "move", 0);
  assert.equal(s.status, "playing");
  beginConversation(s, "mara");
  assert.match(conversationView(s, "mara")!.reply, /热汤/);
  beginConversation(s, "cartographer");
  assert.ok(conversationView(s, "cartographer")!.choices.length <= 3);
  assert.ok(choose(s, "cartographer", "handover").ok);
  assert.equal(s.status, "won");
  const after = JSON.stringify(s);
  assert.equal(act(s, "finish").ok, false);
  assert.equal(choose(s, "cartographer", "handover").ok, false);
  assert.equal(JSON.stringify(s), after);
  assert.ok(validate(s));
});

test("controller persists handover before opening the ending and blocks insight and withdrawal on conflict", () => {
  const s = create(8);
  recovered(s);
  let saved = JSON.stringify(s);
  const game = createGameController({
    getItem: () => saved,
    setItem: (_, raw) => {
      saved = raw;
    },
  });
  game.observePoint("cartographer");
  game.chooseDialogue("handover", game.conversation.value!.memory.revision);
  assert.equal(game.dialog.value, "ending");
  assert.equal(JSON.parse(saved).status, "won");
  game.dispose();
  const t = create(4);
  t.position = 7;
  act(t, "explore");
  const blocked = createGameController({
    getItem: () => JSON.stringify(t),
    setItem: () => {
      throw new Error("should not write");
    },
  });
  blocked.storageChanged({ key: "mistbound-expedition-v1" } as StorageEvent);
  const before = JSON.stringify(blocked.state.value);
  blocked.resolveEncounter("insight");
  blocked.withdrawEncounter();
  assert.equal(JSON.stringify(blocked.state.value), before);
  blocked.dispose();
});

test("legacy terminal saves remain terminal and malformed new memory is rejected", () => {
  const s = create(6);
  recovered(s);
  s.status = "won";
  assert.equal(
    loadGame({ getItem: () => JSON.stringify(s), setItem: () => {} }).state
      .status,
    "won",
  );
  for (const patch of [
    { insightSites: [7, 7] },
    { insightSites: [19] },
    { insightSites: "7" },
    { letterStage: "invented" },
  ]) {
    assert.equal(validate({ ...s, ...patch }), false);
  }
  assert.equal(validate({ ...create(6), insightSites: [7] }), false);
});

test("one continuous expedition completes all insights, the message and handover across 100 seeds", () => {
  for (let seed = 0; seed < 100; seed++) {
    const s = create(seed);
    beginConversation(s, "courier");
    choose(s, "courier", "topic1");
    beginConversation(s, "mara");
    choose(s, "mara", "buy");
    for (const id of [1, 7, 1, 6, 16, 5, 4, 12, 3, 0]) {
      assert.ok(act(s, "move", id).ok);
      if (id === 7 && !s.tiles[id].searched) {
        observe(s, "runes");
        observe(s, "center");
      } else if (id === 16) {
        beginConversation(s, "scholar");
        choose(s, "scholar", "letter");
        choose(s, "scholar", "topic1");
        observe(s, "orrery");
      } else if (id === 12) {
        observe(s, "relief");
        observe(s, "statue");
      }
      if ([7, 12, 16].includes(id) && !s.tiles[id].searched) {
        assert.ok(act(s, "explore").ok);
        assert.ok(act(s, "resolve", "insight").ok);
      }
    }
    beginConversation(s, "courier");
    choose(s, "courier", "deliver");
    beginConversation(s, "cartographer");
    choose(s, "cartographer", "handover");
    assert.equal(s.status, "won");
    assert.equal(s.hp, 12);
    assert.deepEqual(s.insightSites, [7, 16, 12]);
    assert.equal(s.letterStage, "delivered");
    assert.equal(s.time, 16);
    assert.ok(validate(s));
  }
});
