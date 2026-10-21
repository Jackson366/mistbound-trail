<script setup lang="ts">
import type { DialogueTurn } from "../types";
defineProps<{
  turn: DialogueTurn;
  speaker: string;
  latest?: boolean;
  notice?: string;
}>();
</script>
<template>
  <div
    class="chat-turn"
    :class="{
      'player-turn': turn.role === 'player',
      'conversation-reply': latest,
    }"
    :tabindex="latest ? -1 : undefined"
  >
    <span class="chat-speaker">{{ speaker }}</span>
    <p class="chat-bubble">{{ turn.text }}</p>
    <p
      v-if="notice"
      class="conversation-notice"
      :role="latest ? 'status' : undefined"
    >
      {{ notice }}
    </p>
  </div>
</template>
