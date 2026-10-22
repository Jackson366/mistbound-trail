<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from "vue";
import { useGame } from "../composables/useGame";
import { key } from "../data/locations";
import SceneArt from "./SceneArt.vue";
import GameObjective from "./GameObjective.vue";
import ConversationPanel from "./ConversationPanel.vue";
const {
  state,
  here: tile,
  place,
  playing,
  sceneOpen,
  activePoint,
  dialog,
  localClues,
  observation,
  conversation,
  restRecovery,
  leaveScene,
  observePoint,
  explore,
  perform,
} = useGame();
const backButton = ref<HTMLButtonElement>();
const observationPanel = ref<HTMLElement>();
watch(activePoint, async (id) => {
  if (!id) return;
  await nextTick();
  observationPanel.value?.scrollIntoView({
    block: "start",
    behavior: "instant",
  });
});
const seen = computed(() => new Set(state.value.discoveries || []));
const pointDisabled = computed(
  () => !playing.value || state.value.pending !== null,
);
const note = computed(() =>
  !playing.value
    ? "远征已结束，可回看线索或开启新旅程。"
    : state.value.pending !== null
      ? "请先处理遭遇，再继续查看。"
      : tile.value.id === 0
        ? state.value.sigils === 3
          ? "三枚印记已经齐备。与窗边的奥伦交谈，亲手交还星盘。"
          : "补给：3 金币换 4 份。休整：2 时段恢复全部生命。"
        : tile.value.searched
          ? `此地已调查。休整需 1 补给、2 时段，恢复 ${restRecovery.value} 生命；也可继续查看见闻或返回地图。`
          : `调查需 1 时段。野外休整需 1 补给、2 时段，恢复 ${restRecovery.value} 生命${restRecovery.value === 6 ? "（苦艾标记的背风处）" : ""}。`,
);
function shortcut(e: KeyboardEvent) {
  if (
    !sceneOpen.value ||
    dialog.value ||
    e.isComposing ||
    e.repeat ||
    e.ctrlKey ||
    e.metaKey ||
    e.altKey ||
    (e.target instanceof Element &&
      e.target.closest(
        'input,textarea,select,summary,[contenteditable="true"]',
      ))
  )
    return;
  const index = Number(e.key) - 1;
  if (/^[1-5]$/.test(e.key) && place.value.points[index]) {
    e.preventDefault();
    observePoint(place.value.points[index].id);
  }
}
function showIntro() {
  activePoint.value = null;
}
onMounted(() => {
  backButton.value?.focus();
  window.addEventListener("keydown", shortcut);
});
onBeforeUnmount(() => window.removeEventListener("keydown", shortcut));
</script>
<template>
  <main id="location-view" aria-label="地点场景">
    <div class="scene-heading">
      <button ref="backButton" class="back-button" @click="leaveScene">
        ← 返回区域地图
      </button>
      <div>
        <h1>{{ place.title }}</h1>
        <p>{{ place.air }}</p>
      </div>
      <span class="scene-visited">{{
        tile.searched && tile.sigil ? "印记已取回" : "自由交谈与观察"
      }}</span>
    </div>
    <section class="stage-column" aria-label="场景画面">
      <div class="scene-canvas">
        <SceneArt
          id="stage-art"
          :tile="tile"
          uid="full"
          :time="state.time"
          aria-hidden="true"
        />
        <div class="scene-hotspots">
          <button
            v-for="(point, i) in place.points"
            :key="point.id"
            class="scene-hotspot"
            :class="{
              examined: seen.has(key(tile.id, point.id)),
              selected: activePoint === point.id,
            }"
            :style="{ left: point.x + '%', top: point.y + '%' }"
            :aria-pressed="activePoint === point.id"
            :aria-label="`${point.kind === 'talk' ? '交谈' : '查看'}：${point.label}${seen.has(key(tile.id, point.id)) ? '，已查看' : ''}`"
            :disabled="pointDisabled"
            @click="observePoint(point.id)"
          >
            <span class="point-key" aria-hidden="true">{{ i + 1 }}</span
            >{{ point.label.split(" · ").at(-1)
            }}<span v-if="seen.has(key(tile.id, point.id))" aria-hidden="true"
              >✓</span
            >
          </button>
        </div>
      </div>
    </section>
    <section class="scene-story-panel" aria-label="对话与行动">
      <section ref="observationPanel" class="scene-narrative">
        <div class="section-title">
          <span>{{
            conversation ? "人物交谈" : observation ? "查看结果" : "地点见闻"
          }}</span
          ><button v-if="observation" class="text-button" @click="showIntro">
            地点介绍
          </button>
        </div>
        <ConversationPanel v-if="conversation" :key="conversation.id" />
        <article v-else-if="observation" class="observation" aria-live="polite">
          <span class="observation-type">{{ observation.label }}</span>
          <h2>{{ observation.title }}</h2>
          <p>{{ observation.text }}</p>
          <div v-if="observation.clue" class="clue-found">
            ✦ {{ observation.clue }}
          </div>
        </article>
        <template v-else
          ><p v-for="(text, i) in place.intro" :key="i" class="scene-prose">
            {{ text }}
          </p></template
        >
      </section>
      <div class="stage-action-tray">
        <div v-if="!observation" class="interaction-hint">
          <span>点击人物或物件，了解这里的故事。</span
          ><small>查看免费 · 支持数字键 1–5</small>
        </div>
        <details class="scene-object-list">
          <summary>
            人物与物件 <span>{{ place.points.length }} 个交互点</span>
          </summary>
          <div class="point-actions">
            <button
              v-for="(point, i) in place.points"
              :key="point.id"
              class="point-action"
              :class="{ selected: activePoint === point.id }"
              :aria-pressed="activePoint === point.id"
              :disabled="pointDisabled"
              @click="observePoint(point.id)"
            >
              <span
                >{{ point.label.split(" · ").at(-1)
                }}<kbd>{{ i + 1 }}</kbd></span
              ><small
                >{{ point.kind === "talk" ? "交谈" : "查看" }} ·
                {{
                  seen.has(key(tile.id, point.id)) ? "已记录" : "未查看"
                }}</small
              >
            </button>
          </div>
        </details>
        <div class="stage-primary-actions">
          <p class="action-note">{{ note }}</p>
          <div id="stage-actions">
            <template v-if="tile.id === 0"
              ><button
                class="button"
                :disabled="!playing || state.hp === 12"
                @click="perform('rest')"
              >
                {{ state.hp === 12 ? "生命已满" : "休整 · 2 时段" }}</button
              ><button
                class="button primary"
                :disabled="!playing"
                @click="
                  observePoint(state.sigils === 3 ? 'cartographer' : 'mara')
                "
              >
                {{ state.sigils === 3 ? "向奥伦交还星盘" : "向玛拉购买补给" }}
              </button></template
            ><template v-else
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
                扎营休整 · 恢复 {{ restRecovery }} 生命</button
              ><button
                class="button primary"
                :disabled="!playing || tile.searched"
                @click="explore"
              >
                {{
                  state.pending !== null
                    ? "继续处理遭遇"
                    : tile.searched
                      ? "此地已调查"
                      : "调查此地 · 1 时段"
                }}
              </button></template
            >
          </div>
        </div>
      </div>
      <details class="scene-clues">
        <summary>
          已记录的线索
          <span>{{ localClues.length }} 条见闻</span>
        </summary>
        <button
          v-for="clue in localClues"
          :key="clue.key"
          class="clue-row"
          @click="observePoint(clue.id)"
        >
          <span>✦ {{ clue.clue }}</span
          ><span>回看 ↗</span>
        </button>
        <p v-if="!localClues.length" class="empty-clues">
          与人物交谈或查看物件，新的线索会记在这里。
        </p>
      </details>
      <details class="scene-goal">
        <summary>
          远征目标 <span>{{ state.sigils }} / 3 枚印记</span>
        </summary>
        <GameObjective />
      </details>
    </section>
  </main>
</template>
