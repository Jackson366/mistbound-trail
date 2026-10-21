<script setup lang="ts">
import { useGame, timeLabel } from "../composables/useGame";
import HexMap from "./HexMap.vue";
import ResourceBar from "./ResourceBar.vue";
import LocationDetails from "./LocationDetails.vue";
const { state, currentTime, saveError, openDialog } = useGame();
function focusMap() {
  document
    .getElementById("map-title")
    ?.scrollIntoView({
      block: "center",
      behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
}
</script>
<template>
  <div class="app-shell">
    <nav class="rail" aria-label="远征工具">
      <button class="rail-item active" @click="focusMap">
        <span>⌖</span>地图</button
      ><button class="rail-item" @click="openDialog('journal')">
        <span>▤</span>手记</button
      ><button class="rail-item" @click="openDialog('pack')">
        <span>♧</span>行囊
      </button>
      <div class="rail-bottom">
        <button class="rail-item" @click="openDialog('reset')">
          <span>↻</span>新旅程
        </button>
        <div class="rail-caption">愿星辰<br />指引归途</div>
      </div>
    </nav>
    <main>
      <div class="heading-row">
        <div>
          <div class="eyebrow">THE GREYPINE FRONTIER</div>
          <h1>越过已知的边界<span>。</span></h1>
          <p class="intro">雾后有古老的秘密，也有回家的路。</p>
        </div>
        <div class="day-indicator">
          <span>第 {{ currentTime.day }} 日</span
          ><small
            >{{
              currentTime.hour < 12
                ? "清晨"
                : currentTime.hour < 18
                  ? "午后"
                  : "夜间"
            }}
            · {{ String(currentTime.hour).padStart(2, "0") }}:00</small
          >
        </div>
      </div>
      <ResourceBar /><HexMap />
      <section class="bottom-grid">
        <div class="quest">
          <div class="section-title">
            <span>✧ 当前远征</span><span class="chip">主线目标</span>
          </div>
          <h3>失落的星盘</h3>
          <p>
            找回散落在灰松谷的三枚古代印记，<br />带回烛溪村，让沉寂的星盘重新转动。
          </p>
          <div class="quest-track">
            <i
              v-for="i in 3"
              :key="i"
              :class="{ complete: state.sigils >= i }"
            />
          </div>
          <small>{{
            state.sigils === 3
              ? "印记已齐，返回烛溪村完成远征。"
              : `已寻回 ${state.sigils} 枚 · 还有 ${3 - state.sigils} 枚等待发现`
          }}</small>
        </div>
        <div class="journal-preview">
          <div class="section-title">
            <span>最近的足迹</span
            ><button class="text-button" @click="openDialog('journal')">
              全部手记 ↗
            </button>
          </div>
          <ol>
            <li v-for="(entry, i) in state.logs.slice(0, 3)" :key="i">
              <time>{{ timeLabel(entry.time) }}</time
              ><span>{{ entry.text }}</span>
            </li>
          </ol>
        </div>
      </section>
      <div class="footer">
        <span :class="{ 'warning-text': saveError }">{{
          saveError || "旅程自动保存在此浏览器"
        }}</span
        ><span>世界种子 / {{ state.seed }}</span>
      </div>
    </main>
    <LocationDetails />
  </div>
</template>
