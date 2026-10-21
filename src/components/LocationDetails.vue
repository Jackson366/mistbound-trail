<script setup lang="ts">
import { computed } from "vue";
import { useGame } from "../composables/useGame";
import { biomeNames, featureNames, distance } from "../engine/game";
import { get } from "../data/locations";
import SceneArt from "./SceneArt.vue";
const { state, selected: tile, here, playing, enterScene, perform } = useGame();
const at = computed(() => tile.value.id === here.value.id),
  adjacent = computed(() => distance(tile.value, here.value) === 1);
const place = computed(() => get(tile.value));
const note = computed(() =>
  !playing.value
    ? "远征已结束，仍可进入地点回看见闻。"
    : at.value
      ? "进入后可交谈、查看物件与调查。"
      : state.value.pending !== null
        ? "请先返回当前地点，处理待定的遭遇。"
        : !adjacent.value
          ? "距离较远，请先选择与你相邻的地块。"
          : state.value.food === 0
            ? "补给耗尽：本次前往将损失 2 生命。"
            : "消耗 1 时段、1 份补给，到达后展开场景。",
);
</script>
<template>
  <aside class="location-panel" aria-label="地点详情">
    <div class="scene" aria-hidden="true">
      <SceneArt
        v-if="tile.visible"
        :tile="tile"
        uid="detail"
        :time="state.time"
        preview
      />
      <div v-else class="fog-scene">⋯<small>等待探索</small></div>
    </div>
    <div class="location-copy">
      <div class="location-eyebrow">
        <span>{{
          at
            ? "你的位置"
            : tile.visible
              ? biomeNames[tile.biome] + " · " + featureNames[tile.feature]
              : "尚未发现"
        }}</span
        ><span v-if="tile.searched">已调查 ✓</span>
      </div>
      <h2>{{ tile.visible ? tile.name : "雾中的远方" }}</h2>
      <p>
        {{
          tile.visible
            ? place.intro[0]
            : "这片区域还隐藏在迷雾中。靠近后，地形与故事会逐渐清晰。"
        }}
      </p>
      <p v-if="tile.visible && tile.sigil" class="location-clue">
        ✦ {{ tile.searched ? "这里的印记已取回" : "附近有古代印记的线索" }}
      </p>
      <div class="actions">
        <button v-if="at" class="button primary" @click="enterScene">
          进入地点场景 ↗</button
        ><button
          v-else
          class="button primary"
          :disabled="!playing || !adjacent || state.pending !== null"
          @click="perform('move', tile.id)"
        >
          前往此地 →
        </button>
      </div>
      <p
        class="action-note"
        :class="{ 'warning-text': !at && adjacent && state.food === 0 }"
      >
        {{ note }}
      </p>
    </div>
  </aside>
</template>
