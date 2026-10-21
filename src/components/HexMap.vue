<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useGame } from "../composables/useGame";
import { icon } from "../rendering/icons";
import type { Tile } from "../types";
const { state, selectTile } = useGame();
const stage = ref<HTMLElement>(),
  scale = ref(0.9);
let observer: ResizeObserver | undefined;
const mapStyle = computed(() => ({
  transform: `translate(-50%,-50%) scale(${scale.value})`,
}));
function position(t: Tile) {
  return {
    left: 300 + Math.sqrt(3) * 63 * (t.q + t.r / 2) - 54.5 + "px",
    top: 260 + 94.5 * t.r - 62.5 + "px",
  };
}
function picture(t: Tile) {
  return icon(
    !t.visible
      ? "fog"
      : t.id === 0
        ? "settlement"
        : ["tower", "abbey", "castle", "dungeon", "lair"].includes(t.feature)
          ? t.feature
          : t.biome,
  );
}
onMounted(() => {
  if (typeof ResizeObserver === "undefined") return;
  observer = new ResizeObserver(() => {
    const box = stage.value;
    if (box?.clientWidth)
      scale.value = Math.min(
        1.08,
        (box.clientWidth - 25) / 560,
        (box.clientHeight - 10) / 510,
      );
  });
  if (stage.value) observer.observe(stage.value);
});
onBeforeUnmount(() => observer?.disconnect());
</script>
<template>
  <section class="map-panel" aria-labelledby="map-title">
    <div class="map-heading">
      <div>
        <span class="tiny-label">区域地图</span>
        <h2 id="map-title">灰松谷 <span>THE GREYPINE</span></h2>
      </div>
      <span class="map-count"
        >已发现 {{ state.tiles.filter((t) => t.visible).length }} / 19</span
      >
    </div>
    <div ref="stage" class="map-stage">
      <div class="map-watermark">北境勘探局 · 未完全测绘</div>
      <div class="compass" aria-hidden="true"><span>N</span>✥</div>
      <div id="map" :style="mapStyle" aria-label="十九格六角地图">
        <button
          v-for="tile in state.tiles"
          :key="tile.id"
          class="hex"
          :class="[
            tile.visible ? tile.biome : 'fog',
            {
              selected: state.selected === tile.id,
              current: state.position === tile.id,
              visited: tile.searched,
            },
          ]"
          :style="position(tile)"
          :aria-label="`${tile.visible ? tile.name : '未探索区域'}，坐标 ${tile.q},${tile.r}${state.position === tile.id ? '，你的位置' : ''}`"
          :aria-pressed="state.selected === tile.id"
          @click="selectTile(tile.id)"
        >
          <span v-html="picture(tile)" /><span class="hex-name">{{
            tile.visible ? tile.name : "迷雾"
          }}</span
          ><span class="hex-coordinate"
            >{{ String(tile.id + 1).padStart(2, "0")
            }}{{ tile.searched ? " · 已调查" : "" }}</span
          >
        </button>
      </div>
      <div class="map-scale"><i /><span>每格约 2 英里</span></div>
      <div class="map-flavor">未知之地，静候足迹。</div>
    </div>
    <div class="map-legend">
      <span><i class="legend-current" />你的位置</span
      ><span><i class="legend-known" />已发现</span
      ><span><i class="legend-fog" />迷雾</span
      ><span class="legend-hint">点击地块查看详情</span>
    </div>
  </section>
</template>
