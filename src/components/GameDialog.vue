<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { useGame, timeLabel } from "../composables/useGame";
const {
  state,
  dialog,
  result,
  here,
  allClues,
  playing,
  sceneOpen,
  closeDialog,
  openDialog,
  resolveEncounter,
  continueJourney,
  newExpedition,
} = useGame();
const element = ref<HTMLDialogElement>();
let trigger: HTMLElement | null = null;
const titles = {
  help: "写下你的第一段旅程",
  journal: "你的远征手记",
  pack: "旅人的行囊",
  reset: "开启新的远征？",
  encounter: "星光之下的抉择",
  result: "发现已收入行囊",
  ending: "远征结算",
};
const title = computed(() =>
  dialog.value
    ? dialog.value === "ending"
      ? state.value.status === "won"
        ? "星辰，终于归来"
        : "旅程止步于此"
      : dialog.value === "result"
        ? result.value?.damage
          ? "带着伤痕的收获"
          : "发现已收入行囊"
        : titles[dialog.value]
    : "",
);
watch(dialog, async (kind, previous) => {
  await nextTick();
  const modal = element.value;
  if (!modal) return;
  if (kind) {
    if (!previous)
      trigger =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
    if (!modal.open) modal.showModal();
    (kind === "reset"
      ? modal.querySelector<HTMLButtonElement>("[data-cancel]")
      : modal.querySelector<HTMLButtonElement>(".close-button")
    )?.focus();
  } else {
    if (modal.open) modal.close();
    if (trigger?.isConnected && !trigger.hasAttribute("disabled"))
      trigger.focus();
    else
      document
        .querySelector<HTMLButtonElement>(
          sceneOpen.value ? ".back-button" : ".utility-nav button",
        )
        ?.focus();
  }
});
function nativeClose() {
  if (dialog.value) closeDialog();
}
</script>
<template>
  <dialog
    ref="element"
    aria-labelledby="dialog-title"
    @close="nativeClose"
    @cancel="closeDialog"
  >
    <div class="dialog-top">
      <span class="tiny-label">远征手册</span
      ><button
        class="close-button"
        aria-label="关闭对话框"
        @click="closeDialog"
      >
        ×
      </button>
    </div>
    <h2 id="dialog-title">{{ title }}</h2>
    <template v-if="dialog === 'help'"
      ><p>
        你是一名边境旅人。找回三枚古代印记，并带回地图中央的烛溪村，即可完成远征。
      </p>
      <h3>移动与调查</h3>
      <p>
        点击相邻地块，再点「前往此地」。每步消耗 1 时段、1
        补给，并揭开周围迷雾。一个时段为 2 小时。调查此地消耗 1 时段。
      </p>
      <h3>地点场景</h3>
      <p>
        到达地点后，点击人物或物件查看见闻，也可使用底部同名按钮或数字键
        1–5。交谈与查看免费，不会发放物资。正式调查按按钮标注消耗时段。
      </p>
      <h3>补给与休整</h3>
      <p>
        补给耗尽时，每次移动损失 2 生命。村中花 3 金币换 4 份补给，休整 2
        时段恢复全部生命。野外休整消耗 1 补给、2 时段，恢复 4 生命。
      </p>
      <h3>遭遇与选择</h3>
      <p>
        冒险掷 D6：4–6 平安，1–3 损失 3 生命；或花 2 时段、1
        补给谨慎绕行。无补给时，谨慎绕行损失 2
        生命。两种选择都能取得发现；生命降至 0 则远征结束。
      </p>
      <h3>地图如何生长</h3>
      <p>
        采用 Sandbox Generator
        的十九格六角扩展、相邻地貌延续和地点分层方法，并补充原创行动规则。村庄不构成独立势力；势力目前提供地点背景，尚无外交与战争。存档仅保存在当前浏览器。
      </p></template
    >
    <template v-else-if="dialog === 'journal'"
      ><p>每一步选择，都让这片边境多了一段故事。</p>
      <div v-for="(entry, i) in state.logs" :key="i" class="log-entry">
        <small>{{ timeLabel(entry.time) }}</small
        >{{ entry.text }}
      </div>
      <div class="scene-journal-group">
        <h3>已收集的地点线索 · {{ allClues.length }}</h3>
        <p v-for="clue in allClues" :key="clue.key">
          <small>{{ state.tiles[clue.locationId].name }}</small
          ><br />✦ {{ clue.clue }}<br />{{ clue.text }}
        </p>
        <p v-if="!allClues.length">
          进入地点场景，与人物交谈或查看物件，线索会保存在这里。
        </p>
      </div></template
    >
    <template v-else-if="dialog === 'pack'"
      ><p>出发前看一眼补给，也记得为返程留一份干粮。</p>
      <div class="inventory-row">
        <span>干粮与饮水</span><b>{{ state.food }} 份</b>
      </div>
      <div class="inventory-row">
        <span>金币</span><b>{{ state.gold }} 枚</b>
      </div>
      <div class="inventory-row">
        <span>古代印记</span><b>{{ state.sigils }} / 3</b>
      </div>
      <h3>随身装备</h3>
      <p>旅行斗篷、旧短剑、火石、制图师的残缺星盘。</p>
      <h3>已知的势力</h3>
      <p
        v-for="tile in state.tiles.filter((t) => t.visible && t.faction)"
        :key="tile.id"
      >
        {{ tile.faction }} · {{ tile.name }}
      </p>
      <p v-if="!state.tiles.some((t) => t.visible && t.faction)">
        暂未发现，继续向边境深处探索。
      </p></template
    >
    <template v-else-if="dialog === 'reset'"
      ><p>当前地图、物资与手记将被全新的旅程替换。新地图会使用新的世界种子。</p>
      <button class="button" data-cancel @click="closeDialog">
        保留当前旅程</button
      ><button class="button primary" @click="newExpedition">
        开启新旅程
      </button></template
    >
    <template v-else-if="dialog === 'encounter'"
      ><p>
        {{
          here.feature === "dungeon"
            ? "墓窟的守卫在黑暗里苏醒。"
            : here.feature === "tower"
              ? "破损的阶梯与符文机关挡住了去路。"
              : "荆棘缠绕着古老的石刻，脚下的土地并不稳固。"
        }}{{
          here.sigil
            ? "你要寻找的印记，就在另一侧。"
            : "一只旅人的旧箱藏在危险之后。"
        }}
      </p>
      <p>你可以冒险一试，也可以寻找安全路线。两种方式都能取得发现。</p>
      <button class="button primary" @click="resolveEncounter('bold')">
        冒险通过 · 掷 D6
      </button>
      <p>4–6 点平安通过；1–3 点损失 3 生命。</p>
      <button class="button" @click="resolveEncounter('careful')">
        谨慎绕行 · 2 时段 + 1 补给
      </button>
      <p>
        {{
          state.food > 0
            ? "消耗补给即可安全取得发现。"
            : "补给已耗尽，谨慎绕行将损失 2 生命。"
        }}
      </p></template
    >
    <template v-else-if="dialog === 'result'"
      ><div v-if="result?.die" class="result-die">⚄ {{ result.die }}</div>
      <p>{{ result?.message }}</p>
      <button class="button primary" @click="continueJourney">
        继续旅程
      </button></template
    >
    <template v-else-if="dialog === 'ending'"
      ><p>
        {{
          state.status === "won"
            ? "烛溪村的星盘再次亮起。你穿过森林、遗迹与浓雾，将失落的星光带回了家。"
            : "你的足迹停在了迷雾深处。边境会记住这位旅人，也等待下一次勇敢的出发。"
        }}
      </p>
      <div class="inventory-row">
        <span>发现地块</span
        ><b>{{ state.tiles.filter((t) => t.visible).length }} / 19</b>
      </div>
      <div class="inventory-row">
        <span>寻回印记</span><b>{{ state.sigils }} / 3</b>
      </div>
      <div class="inventory-row">
        <span>远征用时</span><b>{{ state.time }} 时段</b>
      </div>
      <button class="button primary" @click="openDialog('journal')">
        查看远征手记</button
      ><button class="button" @click="openDialog('reset')">
        开启新旅程
      </button></template
    >
  </dialog>
</template>
