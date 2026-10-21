<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from "vue";
import { useGame } from "../composables/useGame";
import ConversationMessage from "./ConversationMessage.vue";
const {
  conversation,
  playing,
  state,
  chooseDialogue,
  observePoint,
  activePoint,
} = useGame();
const panel = ref<HTMLElement>();
const history = computed(() => conversation.value?.memory.history ?? []);
const earlierCount = computed(() => Math.max(0, history.value.length - 5));
const recentTurns = computed(() => history.value.slice(earlierCount.value));
function noticeAt(index: number) {
  return (
    history.value[index]?.notice ??
    (index === history.value.length - 1
      ? conversation.value?.memory.notice
      : undefined)
  );
}
async function focusReply() {
  await nextTick();
  const reply = panel.value?.querySelector<HTMLElement>(".conversation-reply");
  reply?.focus({ preventScroll: true });
  // Follow the new turn in document flow; do not add an internal chat scroller.
  if (
    reply &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(max-width: 800px)").matches
  )
    reply.scrollIntoView({ block: "nearest", behavior: "instant" });
}
onMounted(focusReply);
watch(() => conversation.value?.memory.revision, focusReply);
</script>
<template>
  <article
    v-if="conversation"
    ref="panel"
    class="conversation"
    :aria-label="`与${conversation.character.name}交谈`"
  >
    <header class="conversation-person">
      <span class="conversation-avatar" aria-hidden="true">{{
        conversation.character.name.slice(0, 1)
      }}</span>
      <div>
        <h2>{{ conversation.character.name }}</h2>
        <p>{{ conversation.character.role }}</p>
      </div>
      <span class="conversation-state">{{
        conversation.memory.node === "end" ? "已道别" : "交谈中"
      }}</span>
    </header>
    <details v-if="earlierCount" class="conversation-history">
      <summary>更早的交谈 · {{ earlierCount }} 条</summary>
      <ol class="conversation-thread" aria-label="更早的交谈">
        <li v-for="(turn, i) in history.slice(0, earlierCount)" :key="i">
          <ConversationMessage
            :turn="turn"
            :speaker="
              turn.role === 'player' ? '你' : conversation.character.name
            "
            :notice="noticeAt(i)"
          />
        </li>
      </ol>
    </details>
    <ol class="conversation-thread recent-thread" aria-label="最近的交谈">
      <li v-for="(turn, i) in recentTurns" :key="earlierCount + i">
        <ConversationMessage
          :turn="turn"
          :speaker="turn.role === 'player' ? '你' : conversation.character.name"
          :latest="i === recentTurns.length - 1"
          :notice="noticeAt(earlierCount + i)"
        />
      </li>
    </ol>
    <div v-if="conversation.choices.length" class="conversation-composer">
      <div class="dialogue-choices" aria-label="选择你的回应">
        <span class="dialogue-cue">选择一句回应</span>
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
            ><span aria-hidden="true" class="reply-mark">↳</span
            >{{ choice.label }}</span
          >
          <small v-if="choice.detail">{{ choice.detail }}</small>
        </button>
      </div>
      <small class="dialogue-help">{{
        conversation.id === "0:mara"
          ? "交谈免费 · 购买按标价扣除金币"
          : "交谈与回看不消耗时段或物资"
      }}</small>
    </div>
    <div
      v-else-if="playing && state.pending === null"
      class="conversation-composer"
    >
      <p class="conversation-ended">这次交谈已结束。</p>
      <button class="button" @click="activePoint && observePoint(activePoint)">
        再聊几句
      </button>
    </div>
  </article>
</template>
