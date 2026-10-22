import { test } from "node:test";
import assert from "node:assert/strict";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { JSDOM } from "jsdom";
import type { Component } from "vue";
import { create } from "../src/engine/game";
import { act } from "../src/engine/game";
// In-memory DOM tests: no browser, preview server or network navigation.
const dom = new JSDOM("<!doctype html><html><body></body></html>", {
  url: "https://mistbound.test/",
});
const win = dom.window;
for (const key of [
  "window",
  "document",
  "navigator",
  "Element",
  "HTMLElement",
  "HTMLDialogElement",
  "SVGElement",
  "Node",
  "Event",
  "StorageEvent",
  "KeyboardEvent",
  "getComputedStyle",
] as const) {
  Object.defineProperty(globalThis, key, {
    value:
      key === "window" ? win : key === "document" ? win.document : win[key],
    writable: true,
    configurable: true,
  });
}
win.HTMLDialogElement.prototype.showModal = function () {
  this.setAttribute("open", "");
};
win.HTMLDialogElement.prototype.close = function () {
  this.removeAttribute("open");
  this.dispatchEvent(new win.Event("close"));
};
win.HTMLElement.prototype.scrollIntoView = function () {};
const { build } = await import("vite");
const { default: vue } = await import("@vitejs/plugin-vue");
const outDir = resolve("node_modules/.cache/mistbound-vue-test");
await build({
  configFile: false,
  logLevel: "silent",
  plugins: [vue()],
  build: {
    outDir,
    emptyOutDir: true,
    minify: false,
    lib: {
      entry: resolve("src/App.vue"),
      formats: ["es"],
      fileName: () => "app.mjs",
    },
    rollupOptions: { external: ["vue"] },
  },
});
const { default: App } = (await import(
  pathToFileURL(resolve(outDir, "app.mjs")).href
)) as { default: Component };
const { mount, flushPromises } = await import("@vue/test-utils");
async function clickText(wrapper: ReturnType<typeof mount>, text: string) {
  const target = wrapper.findAll("button").find((b) => b.text() === text);
  assert.ok(target, `Button exists: ${text}`);
  await target.trigger("click");
  await flushPromises();
}
test("Vue UI renders map, enters a scene, inspects lore and returns without losing progress", async () => {
  win.localStorage.clear();
  const wrapper = mount(App, { attachTo: win.document.body });
  assert.equal(wrapper.findAll(".hex").length, 19);
  assert.equal(wrapper.findAll('[aria-label="角色状态"]').length, 1);
  assert.equal(wrapper.findAll(".location-panel .button.primary").length, 1);
  assert.equal(wrapper.findAll(".location-panel .button").length, 1);
  await clickText(wrapper, "进入地点场景 ↗");
  assert.ok(wrapper.find("#location-view").exists());
  assert.equal(wrapper.findAll("#location-view aside").length, 0);
  assert.ok(wrapper.find('.stage-column[aria-label="场景画面"]').exists());
  assert.ok(
    wrapper
      .find('.scene-story-panel[aria-label="对话与行动"] .scene-narrative')
      .exists(),
  );
  assert.equal(wrapper.findAll(".stage-column #stage-actions").length, 0);
  assert.equal(wrapper.findAll(".scene-story-panel #stage-actions").length, 1);
  assert.equal(wrapper.get(".scene-goal").attributes("open"), undefined);
  assert.equal(wrapper.findAll(".scene-hotspot").length, 5);
  assert.equal(wrapper.findAll('[aria-label="角色状态"]').length, 1);
  assert.equal(wrapper.get(".scene-object-list").attributes("open"), undefined);
  assert.equal(wrapper.get(".scene-clues").attributes("open"), undefined);
  assert.ok(wrapper.find("#stage-art svg").exists());
  const point = wrapper
    .findAll(".scene-hotspot")
    .find((b) => b.text().includes("玛拉"));
  assert.ok(point);
  await point.trigger("click");
  assert.match(wrapper.find(".conversation").text(), /玛拉/);
  assert.equal(wrapper.findAll(".dialogue-choice").length, 3);
  assert.equal(wrapper.findAll(".clue-row").length, 0);
  await wrapper
    .findAll(".dialogue-choice")
    .find((b) => b.text().includes("回程该留多少"))!
    .trigger("click");
  await flushPromises();
  assert.match(wrapper.get(".conversation-notice").text(), /归途的补给/);
  assert.equal(wrapper.findAll(".scene-prose").length, 0);
  await clickText(wrapper, "地点介绍");
  assert.equal(wrapper.findAll(".scene-prose").length, 2);
  assert.equal(wrapper.findAll(".clue-row").length, 1);
  await clickText(wrapper, "手记");
  assert.equal(wrapper.get("dialog").attributes("open"), "");
  assert.match(wrapper.get("dialog").text(), /归途的补给/);
  await clickText(wrapper, "×");
  await clickText(wrapper, "← 返回区域地图");
  assert.equal(wrapper.findAll(".hex").length, 19);
  const saved = JSON.parse(
    win.localStorage.getItem("mistbound-expedition-v1") || "{}",
  );
  assert.deepEqual(saved.discoveries, ["0:mara"]);
  assert.equal(saved.food, 10);
  wrapper.unmount();
});
test("Vue conversation purchase, interruption and reload preserve the exact reply and costs", async () => {
  win.localStorage.clear();
  let wrapper = mount(App, { attachTo: win.document.body });
  await clickText(wrapper, "进入地点场景 ↗");
  await clickText(wrapper, "向玛拉购买补给");
  const buy = wrapper
    .findAll(".dialogue-choice")
    .find((b) => b.text().includes("买四份补给"))!;
  assert.match(buy.text(), /3 金币.*4 补给/);
  await buy.trigger("click");
  await flushPromises();
  assert.match(
    wrapper.get(".conversation-notice").text(),
    /金币 −3 · 补给 \+4/,
  );
  assert.ok(
    win.document.activeElement?.classList.contains("conversation-reply"),
  );
  assert.equal(wrapper.findAll(".dialogue-choice").length, 2);
  assert.equal(wrapper.findAll(".recent-thread .chat-turn").length, 3);
  assert.equal(wrapper.findAll(".recent-thread .player-turn").length, 1);
  assert.equal(
    wrapper.get(".player-turn .chat-bubble").text(),
    "我买四份补给。",
  );
  assert.equal(wrapper.findAll(".conversation-history").length, 0);
  const reply = wrapper.get(".conversation-reply").text();
  await clickText(wrapper, "地点介绍");
  await clickText(wrapper, "向玛拉购买补给");
  assert.equal(wrapper.get(".conversation-reply").text(), reply);
  wrapper.unmount();
  wrapper = mount(App, { attachTo: win.document.body });
  await clickText(wrapper, "进入地点场景 ↗");
  await clickText(wrapper, "向玛拉购买补给");
  assert.equal(wrapper.get(".conversation-reply").text(), reply);
  const saved = JSON.parse(
    win.localStorage.getItem("mistbound-expedition-v1")!,
  );
  assert.equal(saved.food, 14);
  assert.equal(saved.gold, 15);
  await wrapper
    .findAll(".dialogue-choice")
    .find((b) => b.text().includes("先聊到这里"))!
    .trigger("click");
  await flushPromises();
  await clickText(wrapper, "再聊几句");
  assert.match(wrapper.get(".conversation-reply").text(), /又见面了/);
  wrapper.unmount();
});
test("bubble conversation keeps ordered turns and receipts, expands earlier exchanges, and isolates NPC histories", async () => {
  win.localStorage.clear();
  const wrapper = mount(App, { attachTo: win.document.body });
  await clickText(wrapper, "进入地点场景 ↗");
  await clickText(wrapper, "向玛拉购买补给");
  async function choose(label: string) {
    const button = wrapper
      .findAll(".dialogue-choice")
      .find((b) => b.text().includes(label));
    assert.ok(button);
    await button.trigger("click");
    await flushPromises();
  }
  await choose("买四份补给");
  await choose("再看看补给与回程");
  assert.equal(wrapper.findAll(".recent-thread .chat-turn").length, 5);
  assert.match(
    wrapper.get(".recent-thread .conversation-notice").text(),
    /交易完成/,
  );
  await choose("回程该留多少");
  assert.equal(wrapper.findAll(".recent-thread .chat-turn").length, 5);
  assert.equal(
    wrapper.get(".conversation-history").attributes("open"),
    undefined,
  );
  assert.equal(wrapper.findAll(".conversation-history .chat-turn").length, 2);
  await wrapper.get(".conversation-history summary").trigger("click");
  assert.equal(wrapper.get(".conversation-history").attributes("open"), "");
  assert.match(
    wrapper
      .get(".recent-thread .conversation-reply .conversation-notice")
      .text(),
    /归途的补给/,
  );
  assert.equal(wrapper.findAll(".conversation-reply").length, 1);
  const turns = wrapper
    .findAll(".recent-thread .chat-turn")
    .map((t) => (t.classes().includes("player-turn") ? "player" : "npc"));
  assert.deepEqual(turns, ["npc", "player", "npc", "player", "npc"]);
  const oren = wrapper
    .findAll(".scene-hotspot")
    .find((b) => b.text().includes("奥伦"))!;
  await oren.trigger("click");
  await flushPromises();
  assert.equal(wrapper.findAll(".recent-thread .chat-turn").length, 1);
  assert.doesNotMatch(wrapper.get(".conversation-thread").text(), /交易完成/);
  await clickText(wrapper, "向玛拉购买补给");
  assert.equal(wrapper.findAll(".recent-thread .chat-turn").length, 5);
  assert.match(wrapper.get(".recent-thread").text(), /交易完成/);
  assert.match(wrapper.get(".conversation-history").text(), /我买四份补给/);
  assert.doesNotMatch(wrapper.get(".recent-thread").text(), /又见面了/);
  wrapper.unmount();
});
test("Vue dialog cancels reset and movement opens the selected destination scene", async () => {
  win.localStorage.clear();
  const wrapper = mount(App, { attachTo: win.document.body });
  await clickText(wrapper, "新旅程");
  await clickText(wrapper, "保留当前旅程");
  assert.equal(wrapper.get("dialog").attributes("open"), undefined);
  const tiles = wrapper.findAll(".hex");
  await tiles[1].trigger("click");
  await clickText(wrapper, "前往此地 →");
  assert.match(wrapper.find(".scene-heading").text(), /灰松林/);
  assert.equal(wrapper.findAll(".scene-hotspot").length, 3);
  assert.match(wrapper.find(".resources").text(), /补给9/);
  wrapper.unmount();
});
test("Vue dialogue shortage stays inline, retains an exit and supports scene shortcuts without firing during composition", async () => {
  const s = create(17);
  s.gold = 1;
  win.localStorage.setItem("mistbound-expedition-v1", JSON.stringify(s));
  const wrapper = mount(App, { attachTo: win.document.body });
  await clickText(wrapper, "进入地点场景 ↗");
  win.dispatchEvent(
    new win.KeyboardEvent("keydown", { key: "1", isComposing: true }),
  );
  await flushPromises();
  assert.equal(wrapper.findAll(".conversation").length, 0);
  win.dispatchEvent(new win.KeyboardEvent("keydown", { key: "1" }));
  await flushPromises();
  const buy = wrapper
    .findAll(".dialogue-choice")
    .find((b) => b.text().includes("买四份补给"))!;
  await buy.trigger("click");
  await flushPromises();
  assert.match(
    wrapper.get(".conversation-notice").text(),
    /还差 2 金币，未扣款/,
  );
  assert.equal(wrapper.findAll(".dialogue-choice").length, 3);
  const saved = JSON.parse(
    win.localStorage.getItem("mistbound-expedition-v1")!,
  );
  assert.equal(saved.gold, 1);
  assert.equal(saved.food, 10);
  assert.ok(
    wrapper
      .findAll(".dialogue-choice")
      .some((b) => b.text().includes("先聊到这里")),
  );
  wrapper.unmount();
});

test("landmark UI exposes missing evidence, withdraws safely and resolves the unlocked local action", async () => {
  const s = create(17);
  s.position = 7;
  s.selected = 7;
  s.tiles[7].visible = true;
  win.localStorage.setItem("mistbound-expedition-v1", JSON.stringify(s));
  const wrapper = mount(App, { attachTo: win.document.body });
  await clickText(wrapper, "进入地点场景 ↗");
  await clickText(wrapper, "调查此地 · 1 时段");
  assert.match(wrapper.get("dialog").text(), /祭坛 · 找到归乡的星位/);
  const insight = () =>
    wrapper
      .findAll("dialog .dialogue-choice")
      .find((b) => b.text().includes("沿归乡刻痕"))!;
  assert.ok(insight().attributes("disabled") !== undefined);
  assert.match(insight().text(), /尚缺/);
  await clickText(wrapper, "先退回查看线索");
  assert.equal(wrapper.get("dialog").attributes("open"), undefined);
  const clickPoint = async (label: string) => {
    await wrapper
      .findAll(".scene-hotspot")
      .find((b) => b.text().includes(label))!
      .trigger("click");
    await flushPromises();
  };
  await clickPoint("残缺星文");
  await clickPoint("星盘基座");
  await clickText(wrapper, "调查此地 · 1 时段");
  assert.equal(insight().attributes("disabled"), undefined);
  assert.match(insight().text(), /不额外消耗时段.*不消耗物资/);
  await insight().trigger("click");
  await flushPromises();
  assert.match(wrapper.get("dialog").text(), /星盘与凹槽/);
  await clickText(wrapper, "继续旅程");
  await clickPoint("星盘基座");
  assert.match(wrapper.get(".observation").text(), /印记已取回/);
  const saved = JSON.parse(
    win.localStorage.getItem("mistbound-expedition-v1")!,
  );
  assert.deepEqual(saved.insightSites, [7]);
  assert.equal(saved.time, 2);
  wrapper.unmount();
});

test("return UI welcomes the traveller, handover opens a personal ending and persists terminal state", async () => {
  const s = create(19);
  for (const id of [7, 12, 16]) s.tiles[id].searched = true;
  s.sigils = 3;
  s.insightSites = [7, 12, 16];
  s.letterStage = "delivered";
  s.position = 1;
  act(s, "move", 0);
  win.localStorage.setItem("mistbound-expedition-v1", JSON.stringify(s));
  const wrapper = mount(App, { attachTo: win.document.body });
  assert.match(wrapper.get(".objective").text(), /向奥伦交还星盘/);
  assert.equal(wrapper.get("dialog").attributes("open"), undefined);
  await clickText(wrapper, "进入地点场景 ↗");
  await wrapper
    .findAll(".scene-hotspot")
    .find((b) => b.text().includes("玛拉"))!
    .trigger("click");
  await flushPromises();
  assert.match(wrapper.get(".conversation-reply").text(), /热汤/);
  await clickText(wrapper, "向奥伦交还星盘");
  assert.match(wrapper.get(".conversation-reply").text(), /亲手补全/);
  const handover = wrapper
    .findAll(".dialogue-choice")
    .find((b) => b.text().includes("完成远征"))!;
  await handover.trigger("click");
  await flushPromises();
  assert.match(wrapper.get("dialog").text(), /有 3 处古迹/);
  assert.match(wrapper.get("dialog").text(), /信使终于/);
  assert.equal(
    JSON.parse(win.localStorage.getItem("mistbound-expedition-v1")!).status,
    "won",
  );
  await clickText(wrapper, "×");
  assert.equal(wrapper.findAll(".conversation .dialogue-choice").length, 0);
  assert.ok(
    !wrapper
      .findAll("button")
      .some(
        (b) =>
          b.element === win.document.activeElement &&
          b.attributes("disabled") !== undefined,
      ),
  );
  wrapper.unmount();
});
