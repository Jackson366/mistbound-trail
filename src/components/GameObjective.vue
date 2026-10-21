<script setup lang="ts">
import { useGame } from "../composables/useGame";
const { state } = useGame();
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
              ? "返回烛溪村"
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
              ? "带着印记回到地图中央，完成这次远征。"
              : "探索祭坛、墓窟与孤塔，再带着印记回村。"
      }}
    </p>
  </section>
</template>
