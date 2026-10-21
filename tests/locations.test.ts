import { test } from "node:test";
import assert from "node:assert/strict";
import * as G from "../src/engine/game";
import * as L from "../src/data/locations";
import * as A from "../src/rendering/scene-art";
test("all nineteen places have unique authored details and valid hotspot coordinates", () => {
  const s = G.create(728491),
    keys = [];
  for (const t of s.tiles) {
    const p = L.get(t);
    assert.equal(p.intro.length, 2);
    assert.ok(p.points.length >= 3);
    assert.equal(new Set(p.points.map((x) => x.id)).size, p.points.length);
    for (const point of p.points) {
      assert.ok(point.x >= 20 && point.x <= 85);
      assert.ok(point.y >= 25 && point.y <= 75);
      assert.ok(point.text.length > 30);
      keys.push(L.key(t.id, point.id));
    }
  }
  assert.equal(keys.length, 59);
  assert.equal(new Set(keys).size, 59);
  assert.equal(new Set(s.tiles.map((t) => L.get(t).title)).size, 19);
});
test("observations preserve resources, persist clues, and do not duplicate logs", () => {
  const s = G.create(3),
    before = [s.hp, s.food, s.gold, s.time, s.sigils];
  const first = L.observe(s, "cartographer");
  assert.ok(first.ok && first.fresh);
  assert.equal(L.clues(s).length, 1);
  assert.deepEqual([s.hp, s.food, s.gold, s.time, s.sigils], before);
  const logs = s.logs.length;
  const again = L.observe(s, "cartographer");
  assert.ok(again.ok);
  assert.equal(again.fresh, false);
  assert.equal(s.logs.length, logs);
  const saved = JSON.parse(JSON.stringify(s));
  assert.ok(G.validate(saved));
  assert.equal(L.clues(saved, 0)[0].id, "cartographer");
  assert.equal(L.clues(saved, 1).length, 0);
});
test("observations cannot read a different location or bypass an encounter", () => {
  const s = G.create(3);
  assert.equal(L.observe(s, "orrery").ok, false);
  G.act(s, "move", 1);
  G.act(s, "move", 7);
  G.act(s, "explore");
  const before = JSON.stringify(s);
  assert.equal(L.observe(s, "runes").ok, false);
  assert.equal(JSON.stringify(s), before);
  G.act(s, "resolve", "careful");
  assert.equal(L.observe(s, "runes").ok, true);
});
test("core objects reveal lore without granting sigils or formal exploration", () => {
  const s = G.create(3);
  G.act(s, "move", 1);
  G.act(s, "move", 7);
  assert.ok(L.observe(s, "center").ok);
  assert.equal(s.sigils, 0);
  assert.equal(s.tiles[7].searched, false);
  assert.ok(G.act(s, "explore").ok);
  assert.ok(G.act(s, "resolve", "careful").ok);
  assert.equal(s.sigils, 1);
});
test("old saves load, while malformed or duplicate observation keys are rejected", () => {
  const s = G.create(3);
  delete s.discoveries;
  assert.ok(G.validate(s));
  L.observe(s, "mara");
  assert.ok(G.validate(s));
  s.discoveries!.push("0:mara");
  assert.equal(G.validate(s), false);
  s.discoveries = ["19:bad"];
  assert.equal(G.validate(s), false);
  s.discoveries = [null as unknown as string];
  assert.equal(G.validate(s), false);
});
test("each place produces a self-contained scene with independent SVG definitions", () => {
  const s = G.create(3);
  const art = s.tiles.map((t) =>
    A.draw(t, L.get(t), { uid: `scene-${t.id}`, time: 9 }),
  );
  assert.equal(new Set(art).size, 19);
  for (let i = 0; i < art.length; i++) {
    assert.match(art[i], /^<svg /);
    assert.match(art[i], /viewBox="0 0 1200 700"/);
    assert.ok(!/NaN|undefined|(?:href|src)="https?:|<script/.test(art[i]));
    const ids = [...art[i].matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
    assert.equal(new Set(ids).size, ids.length);
    for (const ref of art[i].matchAll(/url\(#([^)]+)\)/g))
      assert.ok(ids.includes(ref[1]));
  }
});
