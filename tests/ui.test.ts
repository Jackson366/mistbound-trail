import { test } from "node:test";
import assert from "node:assert/strict";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { JSDOM } from "jsdom";
import type { Component } from "vue";
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
  await clickText(wrapper, "进入地点场景 ↗");
  assert.ok(wrapper.find("#location-view").exists());
  assert.equal(wrapper.findAll(".scene-hotspot").length, 5);
  assert.ok(wrapper.find("#stage-art svg").exists());
  const point = wrapper
    .findAll(".point-action")
    .find((b) => b.text().includes("玛拉"));
  assert.ok(point);
  await point.trigger("click");
  assert.match(wrapper.find(".observation").text(), /热汤与远路/);
  assert.equal(wrapper.findAll(".clue-row").length, 1);
  await clickText(wrapper, "远征手记");
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
test("Vue dialog cancels reset and movement opens the selected destination scene", async () => {
  win.localStorage.clear();
  const wrapper = mount(App, { attachTo: win.document.body });
  await clickText(wrapper, "↻新旅程");
  await clickText(wrapper, "保留当前旅程");
  assert.equal(wrapper.get("dialog").attributes("open"), undefined);
  const tiles = wrapper.findAll(".hex");
  await tiles[1].trigger("click");
  await clickText(wrapper, "前往此地 →");
  assert.match(wrapper.find(".scene-caption").text(), /灰松林/);
  assert.equal(wrapper.findAll(".scene-hotspot").length, 3);
  assert.match(wrapper.find(".stage-resources").text(), /9补给/);
  wrapper.unmount();
});
