<script setup lang="ts">
import { useGame } from "../composables/useGame";
const { state } = useGame();
</script>
<template>
  <section class="resources" aria-label="角色状态">
    <div>
      <span class="resource-icon hp-icon">♡</span
      ><span
        ><small>生命</small><b>{{ state.hp }} / 12</b></span
      >
      <div class="health-track">
        <i :style="{ width: (state.hp / 12) * 100 + '%' }" />
      </div>
    </div>
    <div>
      <span class="resource-icon">♧</span
      ><span
        ><small>补给</small><b>{{ state.food }} 份</b></span
      >
    </div>
    <div>
      <span class="resource-icon gold-icon">◈</span
      ><span
        ><small>金币</small><b>{{ state.gold }}</b></span
      >
    </div>
    <div>
      <span class="resource-icon">✧</span
      ><span
        ><small>古代印记</small><b>{{ state.sigils }} / 3</b></span
      >
    </div>
  </section>
</template>
