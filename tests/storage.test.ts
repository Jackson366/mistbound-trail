import { test } from "node:test";
import assert from "node:assert/strict";
import { create } from "../src/engine/game";
import {
  loadGame,
  saveGame,
  SAVE_KEY,
  type SaveStorage,
} from "../src/engine/storage";
import { createGameController } from "../src/composables/useGame";
function memory(initial: string | null = null): SaveStorage {
  let current = initial;
  return {
    getItem: () => current,
    setItem: (_key, value) => {
      current = value;
    },
  };
}
test("legacy saves keep position, supplies and discoveries after loading", () => {
  const original = create(123);
  delete original.discoveries;
  const storage = memory(JSON.stringify(original));
  const loaded = loadGame(storage);
  assert.equal(loaded.blocked, false);
  assert.deepEqual(loaded.state.discoveries, []);
  assert.equal(loaded.state.seed, 123);
  assert.equal(saveGame(loaded.state, storage), "");
  assert.equal(loadGame(storage).state.food, 10);
});
test("corrupt or unavailable storage is reported and never overwritten on load", () => {
  const storage = memory("{broken");
  const loaded = loadGame(storage);
  assert.ok(loaded.error);
  assert.equal(loaded.blocked, true);
  assert.equal(storage.getItem(SAVE_KEY), "{broken");
  assert.ok(loadGame().error);
  assert.ok(
    saveGame(create(1), {
      getItem: () => null,
      setItem: () => {
        throw new Error("quota");
      },
    }),
  );
});
test("Vue controller shares state across selection, travel, observations and save", () => {
  const storage = memory();
  const game = createGameController(storage);
  game.selectTile(1);
  assert.equal(game.selected.value.id, 1);
  game.perform("move", 1);
  assert.equal(game.sceneOpen.value, true);
  assert.equal(game.here.value.id, 1);
  game.observePoint("bark");
  assert.equal(game.localClues.value.length, 1);
  assert.equal(loadGame(storage).state.position, 1);
  game.leaveScene();
  assert.equal(game.sceneOpen.value, false);
  assert.equal(game.state.value.food, 9);
  game.dispose();
});
test("cross-tab conflict blocks game changes until explicit reset or reload", () => {
  const game = createGameController(memory());
  game.storageChanged({ key: SAVE_KEY } as StorageEvent);
  const before = JSON.stringify(game.state.value);
  game.perform("move", 1);
  game.observePoint("mara");
  assert.equal(JSON.stringify(game.state.value), before);
  assert.match(game.saveError.value, /另一页面/);
  game.dispose();
});
