<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from "vue";
import { useGame } from "../composables/useGame";
const {
  conversation,
  playing,
  state,
  chooseDialogue,
  observePoint,
  activePoint,
} = useGame();
const reply = ref<HTMLElement>();
async function focusReply() {
  await nextTick();
  reply.value?.focus({ preventScroll: true });
}
onMounted(focusReply);
watch(() => conversation.value?.memory.revision, focusReply);
</script>
<template>
  <article
    v-if="conversation"
    class="conversation"
    :aria-label="`与${conversation.character.name}交谈`"
  >
    <header class="conversation-person">
      <h2>{{ conversation.character.name }}</h2>
      <span>{{ conversation.character.role }}</span>
    </header>
    <div ref="reply" class="conversation-reply" tabindex="-1">
      <p>{{ conversation.reply }}</p>
      <p
        v-if="conversation.memory.notice"
        class="conversation-notice"
        role="status"
      >
        {{ conversation.memory.notice }}
      </p>
    </div>
    <div
      v-if="conversation.choices.length"
      class="dialogue-choices"
      aria-label="选择你的回应"
    >
      <span class="dialogue-cue">你的回应</span>
      <button
        v-for="choice in conversation.choices"
        :key="`${conversation.memory.revision}:${choice.id}`"
        class="dialogue-choice"
        :class="{
          'paid-choice': choice.paid,
          'leave-choice': choice.id === 'leave',
        }"
        :disabled="!playing || state.pending !== null"
        @click="chooseDialogue(choice.id, conversation.memory.revision)"
      >
        <span
          >{{ choice.label }}
          <span aria-hidden="true">{{
            choice.id === "leave" ? "↙" : "→"
          }}</span></span
        >
        <small v-if="choice.detail">{{ choice.detail }}</small>
      </button>
      <small class="dialogue-help">{{
        conversation.id === "0:mara"
          ? "交谈不消耗时段，只有购买选项会扣除金币。"
          : "交谈与回看不消耗时段或物资。"
      }}</small>
    </div>
    <button
      v-else-if="playing && state.pending === null"
      class="button"
      @click="activePoint && observePoint(activePoint)"
    >
      再聊几句
    </button>
    <details
      v-if="conversation.memory.history.length > 1"
      class="conversation-history"
    >
      <summary>最近的交谈记录</summary>
      <p v-for="(turn, i) in conversation.memory.history.slice(0, -1)" :key="i">
        <small>{{
          turn.role === "player" ? "你" : conversation.character.name
        }}</small
        >{{ turn.text }}
      </p>
    </details>
  </article>
</template>
