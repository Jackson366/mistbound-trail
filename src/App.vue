<script setup lang="ts">
import { provideGame } from "./composables/useGame";
import MapView from "./components/MapView.vue";
import LocationScene from "./components/LocationScene.vue";
import GameDialog from "./components/GameDialog.vue";
const { sceneOpen, openDialog, toast } = provideGame();
</script>
<template>
  <header class="topbar">
    <a class="brand" href="./" aria-label="雾境行旅首页"
      ><span class="brand-mark">✧</span
      ><span>雾境行旅<small>MISTBOUND · A HEX EXPEDITION</small></span></a
    >
    <div class="expedition-name">
      <span class="live-dot" /> 边境远征 <span class="muted">/</span> 灰松谷
    </div>
    <button class="button ghost" @click="openDialog('help')">
      玩法说明 <span>↗</span>
    </button>
  </header>
  <LocationScene v-if="sceneOpen" /><MapView v-else />
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
