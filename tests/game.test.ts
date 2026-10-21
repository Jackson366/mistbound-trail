import { test } from "node:test";
import assert from "node:assert/strict";
import * as G from "../src/engine/game";
test("seeded 19-hex maps are unique, connected and reproducible", () => {
  for (let seed = 0; seed < 100; seed++) {
    const s = G.create(seed);
    assert.equal(new Set(s.tiles.map((t) => `${t.q},${t.r}`)).size, 19);
    assert.deepEqual(G.generate(seed), s.tiles);
    assert.ok(s.tiles.every((t) => G.distance(t, s.tiles[0]) <= 2));
    assert.ok(G.validate(s));
  }
  assert.notDeepEqual(G.generate(12), G.generate(13));
});
test("invalid moves do not consume resources, adjacent moves reveal fog", () => {
  const s = G.create(123),
    before = JSON.stringify(s);
  assert.equal(G.act(s, "move", 7).ok, false);
  assert.equal(JSON.stringify(s), before);
  assert.equal(G.act(s, "move", 1).ok, true);
  assert.equal(s.food, 9);
  assert.equal(s.time, 1);
  assert.ok(s.tiles.filter((t) => t.visible).length > 7);
});
test("empty landmarks give information and supplies only once", () => {
  const s = G.create(123);
  G.act(s, "move", 1);
  G.act(s, "explore");
  assert.equal(s.food, 11);
  const before = JSON.stringify(s);
  assert.equal(G.act(s, "explore").ok, false);
  assert.equal(JSON.stringify(s), before);
  assert.match(s.logs[0].text, /刻痕/);
});
test("encounter choices persist, block movement and resolve once", () => {
  const s = G.create(12);
  G.act(s, "move", 1);
  G.act(s, "move", 7);
  G.act(s, "explore");
  assert.equal(s.pending, 7);
  assert.ok(G.validate(JSON.parse(JSON.stringify(s))));
  assert.equal(G.act(s, "move", 1).ok, false);
  const r = G.act(s, "resolve", "careful");
  assert.equal(r.ok, true);
  assert.equal(s.sigils, 1);
  assert.equal(s.pending, null);
  assert.equal(G.act(s, "resolve", "careful").ok, false);
});
test("starvation, healing, death and terminal actions enforce bounds", () => {
  const s = G.create(12);
  s.food = 0;
  G.act(s, "move", 1);
  assert.equal(s.hp, 10);
  assert.equal(G.act(s, "rest").ok, false);
  G.act(s, "move", 0);
  G.act(s, "rest");
  assert.equal(s.hp, 12);
  s.hp = 1;
  G.act(s, "move", 1);
  assert.equal(s.hp, 0);
  assert.equal(s.status, "lost");
  assert.equal(G.act(s, "rest").ok, false);
});
test("a complete expedition can recover all sigils and return to camp", () => {
  for (let seed = 1; seed < 30; seed++) {
    const s = G.create(seed);
    function path(target: number): number[] {
      const queue = [[s.position]],
        seen = new Set([s.position]);
      while (queue.length) {
        const p = queue.shift()!;
        if (p.at(-1) === target) return p.slice(1);
        for (const t of s.tiles)
          if (!seen.has(t.id) && G.distance(s.tiles[p.at(-1)!], t) === 1) {
            seen.add(t.id);
            queue.push([...p, t.id]);
          }
      }
      throw new Error("No path");
    }
    for (const target of [7, 12, 16]) {
      while (s.food < 9) assert.ok(G.act(s, "buy").ok);
      for (const id of path(target)) assert.ok(G.act(s, "move", id).ok);
      assert.ok(G.act(s, "explore").ok);
      assert.ok(G.act(s, "resolve", "careful").ok);
      for (const id of path(0)) assert.ok(G.act(s, "move", id).ok);
    }
    assert.equal(s.sigils, 3);
    assert.equal(s.status, "won");
    assert.ok(G.validate(s));
  }
});
test("corrupt and untrusted save data are rejected", () => {
  const s = G.create(123);
  assert.equal(G.validate(null), false);
  s.tiles[0].name = "<script>";
  assert.equal(G.validate(s), false);
  const t = G.create(1);
  t.sigils = 3;
  assert.equal(G.validate(t), false);
});
