<script setup lang="ts">
import { computed } from "vue";
import { useGame } from "../composables/useGame";
import { biomeNames, featureNames, distance } from "../engine/game";
import { get } from "../data/locations";
import SceneArt from "./SceneArt.vue";
const {
  state,
  selected: tile,
  here,
  playing,
  enterScene,
  perform,
  explore,
} = useGame();
const at = computed(() => tile.value.id === here.value.id),
  adjacent = computed(() => distance(tile.value, here.value) === 1);
const place = computed(() => get(tile.value));
const note = computed(() =>
  !playing.value
    ? "远征已结束，可回看手记或开启新旅程。"
    : state.value.pending !== null
      ? "当前位置仍有待处理的遭遇。"
      : at.value
        ? "进入地点场景，与人物交谈或查看物件。"
        : !adjacent.value
          ? "只能移动到与你当前位置相邻的地块。"
          : `消耗 1 时段 · ${state.value.food > 0 ? "1 份补给" : "补给耗尽，将损失 2 生命"}`,
);
</script>
<template>
  <aside class="location-panel" aria-label="地点详情">
    <div class="location-top">
      <span class="tiny-label">你眼前的世界</span
      ><span
        >{{ tile.q >= 0 ? "+" : "" }}{{ tile.q }} / {{ tile.r >= 0 ? "+" : ""
        }}{{ tile.r }}</span
      >
    </div>
    <div class="scene" aria-hidden="true">
      <SceneArt
        v-if="tile.visible"
        :tile="tile"
        uid="detail"
        :time="state.time"
        preview
      />
      <div v-else class="fog-scene">⋯<small>等待雾气散去</small></div>
    </div>
    <div class="location-copy">
      <div class="tags">
        <template v-if="tile.visible"
          ><span>{{ biomeNames[tile.biome] }}</span
          ><span>{{ featureNames[tile.feature] }}</span
          ><span v-if="at">你的位置</span></template
        ><span v-else>尚未测绘</span>
      </div>
      <h2>{{ tile.visible ? tile.name : "雾中的远方" }}</h2>
      <p>
        {{
          tile.visible
            ? place.intro[0]
            : "厚重的雾气覆盖着这片土地。走近它，新的故事才会显露。"
        }}
      </p>
      <div>
        <div class="fact">
          <span>探索状态</span
          ><b>{{
            tile.searched
              ? "已调查"
              : tile.visited
                ? "已抵达"
                : tile.visible
                  ? "已发现"
                  : "未知"
          }}</b>
        </div>
        <div class="fact">
          <span>{{ tile.visible ? "所属势力" : "距离" }}</span
          ><b>{{
            tile.visible
              ? tile.faction || "边境无主之地"
              : `距你 ${distance(tile, here)} 格`
          }}</b>
        </div>
        <div v-if="tile.visible && tile.sigil" class="fact">
          <span>古代星光</span
          ><b>{{ tile.searched ? "印记已取回" : "附近有印记的线索" }}</b>
        </div>
      </div>
      <div class="actions">
        <template v-if="at"
          ><button class="button primary" @click="enterScene">
            进入地点场景 ↗</button
          ><template v-if="tile.id === 0"
            ><button
              class="button"
              :disabled="!playing || state.gold < 3"
              @click="perform('buy')"
            >
              购买补给 · 3 金币换 4 份</button
            ><button
              class="button"
              :disabled="!playing || state.hp === 12"
              @click="perform('rest')"
            >
              在村中休整 · 恢复全部生命
            </button></template
          ><template v-else
            ><button
              class="button"
              :disabled="!playing || tile.searched"
              @click="explore"
            >
              {{
                state.pending !== null
                  ? "继续处理遭遇"
                  : tile.searched
                    ? "此地已调查"
                    : "调查此地 · 1 时段"
              }}</button
            ><button
              class="button"
              :disabled="
                !playing ||
                state.hp === 12 ||
                state.food < 1 ||
                state.pending !== null
              "
              @click="perform('rest')"
            >
              扎营休整 · 1 补给
            </button></template
          ></template
        ><button
          v-else
          class="button primary"
          :disabled="!playing || !adjacent || state.pending !== null"
          @click="perform('move', tile.id)"
        >
          前往此地 →
        </button>
      </div>
      <p class="action-note">{{ note }}</p>
    </div>
    <div class="rumor">
      <span class="tiny-label">旅人传闻</span>
      <p>“旧祭坛、孤塔与地下遗迹……<br />星光总会在被遗忘的地方停留。”</p>
      <small>— 烛溪村的老制图师</small>
    </div>
    <div class="panel-foot">一张地图 · 无数种可能</div>
  </aside>
</template>
