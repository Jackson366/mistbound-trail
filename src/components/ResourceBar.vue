<script setup lang="ts">
import { useGame } from "../composables/useGame";
const { state } = useGame();
</script>
<template>
  <dl class="resources" aria-label="角色状态">
    <div :class="{ critical: state.hp <= 4 }">
      <dt><span aria-hidden="true">♡</span>生命</dt>
      <dd>
        {{ state.hp }}<small> / 12</small
        ><span v-if="state.hp <= 4" class="sr-only">，生命偏低</span>
      </dd>
    </div>
    <div :class="{ critical: state.food === 0 }">
      <dt><span aria-hidden="true">♧</span>补给</dt>
      <dd>{{ state.food }}<small> 份</small></dd>
    </div>
    <div>
      <dt><span aria-hidden="true">◈</span>金币</dt>
      <dd>{{ state.gold }}</dd>
    </div>
    <div>
      <dt><span aria-hidden="true">✧</span>印记</dt>
      <dd>{{ state.sigils }}<small> / 3</small></dd>
    </div>
  </dl>
</template>
