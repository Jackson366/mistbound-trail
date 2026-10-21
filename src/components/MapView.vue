<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useGame } from "../composables/useGame";
import HexMap from "./HexMap.vue";
import LocationDetails from "./LocationDetails.vue";
import GameObjective from "./GameObjective.vue";
const { here } = useGame();
const heading = ref<HTMLHeadingElement>();
onMounted(() => {
  heading.value?.focus({ preventScroll: true });
});
</script>
<template>
  <main class="map-layout">
    <section class="map-workspace" aria-label="区域探索">
      <div class="page-heading">
        <div>
          <h1 ref="heading" tabindex="-1">灰松谷</h1>
          <p>选择相邻地块，前往下一处地点。</p>
        </div>
        <span class="region-label">区域地图</span>
      </div>
      <HexMap />
      <p class="map-guidance">
        <span class="position-dot" aria-hidden="true" />当前位置
        <strong>{{ here.name }}</strong
        ><span class="guidance-cost">每步 1 时段 · 1 补给</span>
      </p>
    </section>
    <div class="map-sidebar"><LocationDetails /><GameObjective /></div>
  </main>
</template>
