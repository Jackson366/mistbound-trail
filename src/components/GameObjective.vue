<script setup lang="ts">
import { computed } from "vue";
import { useGame } from "../composables/useGame";
const { state } = useGame();
const nextTrail = computed(() => {
  const s = state.value;
  if (s.status !== "playing" || s.sigils === 3) return "";
  if (s.sigils === 0)
    return "可以先去灰松林辨认路标，再到沉星祭坛试着对齐星盘。";
  if (!s.tiles[12].searched)
    return "墓窟里的浮雕与石像，也许藏着守卫愿意让路的理由。";
  if (!s.tiles[16].searched)
    return "到孤塔看看暗处的文字，向维恩问起星仪的停顿。";
  return "祭坛上的归乡星纹，还在等待与你的星盘相合。";
});
</script>
<template>
  <section class="objective" aria-label="当前目标">
    <span class="section-kicker">当前目标</span>
    <h2>
      {{
        state.status === "won"
          ? "星光已经归来"
          : state.status === "lost"
            ? "这次远征已经结束"
            : state.sigils === 3
              ? state.position === 0
                ? "向奥伦交还星盘"
                : "返回烛溪村"
              : "寻回三枚古代印记"
      }}
    </h2>
    <p>
      {{
        state.status === "won"
          ? "你把失落的星光带回了家。"
          : state.status === "lost"
            ? "可以回看手记，或开启新的旅程。"
            : state.sigils === 3
              ? state.position === 0
                ? "窗边的制图师正在等你。交还星盘，亲手完成这次远征。"
                : "带着印记回到地图中央，再向奥伦交还星盘。"
              : "探索祭坛、墓窟与孤塔，再带着印记回村。"
      }}
    </p>
    <p v-if="nextTrail">{{ nextTrail }}</p>
  </section>
</template>
