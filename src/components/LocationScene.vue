<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useGame, timeLabel } from "../composables/useGame";
import { biomeNames, featureNames } from "../engine/game";
import { key } from "../data/locations";
import SceneArt from "./SceneArt.vue";
const {
  state,
  here: tile,
  place,
  playing,
  sceneOpen,
  activePoint,
  dialog,
  allClues,
  localClues,
  observation,
  saveError,
  leaveScene,
  openDialog,
  observePoint,
  explore,
  perform,
} = useGame();
const backButton = ref<HTMLButtonElement>();
const seen = computed(() => new Set(state.value.discoveries || []));
const pointDisabled = computed(
  () => !playing.value || state.value.pending !== null,
);
const lastEvent = computed(() =>
  state.value.logs.find(
    (l) => l.locationId === tile.value.id && !/^(交谈|查看)「/.test(l.text),
  ),
);
const goal = computed(() =>
  state.value.status === "won"
    ? "星盘已经完整，你把星光带回了家。"
    : state.value.status === "lost"
      ? "这段远征已经结束，足迹仍留在手记中。"
      : state.value.sigils === 3
        ? "三枚印记已经齐全，返回烛溪村完成远征。"
        : "从祭坛、墓窟与孤塔取回印记，再回到烛溪村。",
);
const note = computed(
  () =>
    saveError.value ||
    (!playing.value
      ? "远征已结束 · 可返回地图查看手记或开启新旅程"
      : state.value.pending !== null
        ? "此地仍有待处理的遭遇，请先选择「继续处理遭遇」。"
        : tile.value.id === 0
          ? "村中休整恢复全部生命；补充干粮获得 4 份补给。进度自动保存。"
          : tile.value.searched
            ? "正式调查已完成，仍可回看见闻，或返回地图继续旅行。"
            : "查看不消耗物资。正式调查可能触发危险，留意生命与补给。"),
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
      e.target.closest('input,textarea,select,[contenteditable="true"]'))
  )
    return;
  const index = Number(e.key) - 1;
  if (/^[1-5]$/.test(e.key) && place.value.points[index]) {
    e.preventDefault();
    observePoint(place.value.points[index].id);
  }
}
onMounted(() => {
  backButton.value?.focus();
  window.addEventListener("keydown", shortcut);
});
onBeforeUnmount(() => window.removeEventListener("keydown", shortcut));
</script>
<template>
  <section id="location-view" aria-label="地点场景">
    <div class="stage-column">
      <div class="stage-toolbar">
        <button ref="backButton" class="text-button" @click="leaveScene">
          ← 返回区域地图</button
        ><span id="stage-weather">{{ place.air }}</span>
        <div class="stage-tools">
          <button class="text-button" @click="openDialog('journal')">
            远征手记</button
          ><button class="text-button" @click="openDialog('pack')">行囊</button>
        </div>
      </div>
      <div class="stage-surround">
        <div class="scene-canvas">
          <SceneArt
            id="stage-art"
            :tile="tile"
            uid="full"
            :time="state.time"
            aria-hidden="true"
          />
          <div class="scene-caption">
            <span class="scene-chapter">{{
              tile.id === 0
                ? "烛溪村 · 旅人的歇脚处"
                : biomeNames[tile.biome] + " · " + featureNames[tile.feature]
            }}</span>
            <h1>{{ place.title }}</h1>
            <p>{{ place.subtitle }}</p>
          </div>
          <div>
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
              <i />{{ point.label }}<span class="point-key">{{ i + 1 }}</span>
            </button>
          </div>
          <div class="scene-coordinates">
            灰松谷 / {{ String(tile.id + 1).padStart(2, "0") }} · {{ tile.q }},
            {{ tile.r }}
          </div>
        </div>
      </div>
      <div class="stage-action-tray">
        <div class="tray-heading">
          <span>可以做的事</span
          ><small>交谈与查看不消耗时段 · 数字键选择调查点</small>
        </div>
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
              >{{ point.label.split(" · ").at(-1) }}<kbd>{{ i + 1 }}</kbd></span
            ><small
              >{{ point.kind === "talk" ? "交谈" : "查看" }} ·
              {{
                seen.has(key(tile.id, point.id)) ? "已记录" : "未查看"
              }}</small
            >
          </button>
        </div>
        <div class="stage-primary-actions">
          <div class="stage-resources">
            <span
              >♡ <b>{{ state.hp }}</b
              ><small>/ 12 生命</small></span
            ><span
              >♧ <b>{{ state.food }}</b
              ><small>补给</small></span
            ><span
              >◈ <b>{{ state.gold }}</b
              ><small>金币</small></span
            ><span
              >✦ <b>{{ allClues.length }}</b
              ><small>线索</small></span
            >
          </div>
          <div id="stage-actions">
            <template v-if="tile.id === 0"
              ><button
                class="button"
                :disabled="!playing || state.gold < 3"
                @click="perform('buy')"
              >
                补充干粮 · 3 金币</button
              ><button
                class="button primary"
                :disabled="!playing || state.hp === 12"
                @click="perform('rest')"
              >
                {{ state.hp === 12 ? "生命已满" : "休整 · 2 时段" }}
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
                扎营 · 1 补给 / 2 时段</button
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
        <div class="scene-save" :class="{ 'warning-text': saveError }">
          {{ note }}
        </div>
      </div>
    </div>
    <aside class="scene-story-panel" aria-label="场景见闻与线索">
      <section class="scene-objective">
        <div class="objective-heading">
          <span>当前目标</span><span>{{ state.sigils }} / 3</span>
        </div>
        <h2>寻回失落的星光</h2>
        <p>{{ goal }}</p>
        <div class="objective-progress">
          <i v-for="i in 3" :key="i" :class="{ complete: state.sigils >= i }" />
        </div>
      </section>
      <section class="scene-narrative">
        <div class="section-title">
          <span>此地见闻</span><span>{{ timeLabel(state.time) }}</span>
        </div>
        <div>
          <p v-for="(text, i) in place.intro" :key="i" class="scene-prose">
            {{ text }}
          </p>
        </div>
        <article v-if="observation" class="observation" aria-live="polite">
          <div class="observation-type">
            {{ observation.kind === "talk" ? "交谈记录" : "调查记录"
            }}<span>{{ observation.label }}</span>
          </div>
          <h3>{{ observation.title }}</h3>
          <p>{{ observation.text }}</p>
          <div v-if="observation.clue" class="clue-found">
            ✦ 线索 · {{ observation.clue }}
          </div>
          <button
            v-if="observation.kind === 'core'"
            class="button primary"
            :disabled="!playing || tile.searched || state.pending !== null"
            @click="explore"
          >
            {{ tile.searched ? "核心区域已调查" : "调查核心区域 · 1 时段" }}
          </button>
        </article>
        <p v-else class="scene-prompt">
          点击场景中的人物或物件，听听这里的故事。
        </p>
        <div v-if="lastEvent" class="scene-event">
          <small>最近行动 · {{ timeLabel(lastEvent.time) }}</small>
          <p>{{ lastEvent.text }}</p>
        </div>
      </section>
      <section class="scene-clues">
        <div class="section-title">
          <span>收集到的线索</span
          ><span
            >{{ localClues.length }} /
            {{ place.points.filter((p) => p.clue).length }}</span
          >
        </div>
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
          此地还没有记录。试着与人物交谈，或查看一件物品。
        </p>
        <p class="clue-explainer">线索用于补全故事，不额外消耗物资。</p>
      </section>
    </aside>
  </section>
</template>
