<script setup lang="ts">
import { provideGame } from "./composables/useGame";
import MapView from "./components/MapView.vue";
import LocationScene from "./components/LocationScene.vue";
import GameDialog from "./components/GameDialog.vue";
import ResourceBar from "./components/ResourceBar.vue";
const { sceneOpen, openDialog, toast, saveError, currentTime, state } =
  provideGame();
</script>
<template>
  <header class="topbar">
    <div class="topbar-inner">
      <a class="brand" href="./" aria-label="雾境行旅首页"
        ><span aria-hidden="true">✧</span>雾境行旅</a
      >
      <nav class="utility-nav" aria-label="远征工具">
        <button @click="openDialog('journal')">手记</button
        ><button @click="openDialog('pack')">行囊</button
        ><button @click="openDialog('help')">玩法</button
        ><button class="quiet-action" @click="openDialog('reset')">
          新旅程
        </button>
      </nav>
    </div>
  </header>
  <div class="expedition-bar">
    <ResourceBar /><span class="expedition-time"
      >第 {{ currentTime.day }} 日 <span>·</span>
      {{ String(currentTime.hour).padStart(2, "0") }}:00</span
    >
  </div>
  <LocationScene v-if="sceneOpen" /><MapView v-else />
  <footer class="app-footer">
    <span
      :class="{ 'warning-text': saveError }"
      :role="saveError ? 'alert' : undefined"
      >{{ saveError || "进度已保存在此浏览器" }}</span
    ><span>世界 {{ state.seed }}</span>
  </footer>
  <div
    class="status"
    :class="{ visible: toast }"
    role="status"
    aria-live="polite"
  >
    {{ toast }}
  </div>
  <GameDialog />
</template>
