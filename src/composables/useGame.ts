import {
  computed,
  inject,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  watch,
  type InjectionKey,
} from "vue";
import * as engine from "../engine/game";
import * as locations from "../data/locations";
import {
  loadGame,
  saveGame,
  SAVE_KEY,
  type SaveStorage,
} from "../engine/storage";
import type { Action, ActionResult, ResolveMode } from "../types";
export type DialogKind =
  | "help"
  | "journal"
  | "pack"
  | "reset"
  | "encounter"
  | "result"
  | "ending"
  | null;
export function clock(time: number) {
  const hours = 6 + time * 2;
  return { day: 1 + Math.floor(hours / 24), hour: hours % 24 };
}
export function timeLabel(time: number) {
  const c = clock(time);
  return `D${c.day} ${String(c.hour).padStart(2, "0")}:00`;
}
export function createGameController(storage?: SaveStorage) {
  const loaded = loadGame(storage),
    state = ref(loaded.state),
    saveError = ref(loaded.error);
  let saveBlocked = loaded.blocked,
    conflict = false,
    timer: ReturnType<typeof setTimeout> | undefined;
  const sceneOpen = ref(false),
    activePoint = ref<string | null>(null),
    dialog = ref<DialogKind>(null),
    toast = ref("");
  const result = ref<ActionResult | null>(null);
  const here = computed(() => state.value.tiles[state.value.position]);
  const selected = computed(() => state.value.tiles[state.value.selected]);
  const place = computed(() => locations.get(here.value));
  const currentTime = computed(() => clock(state.value.time));
  const allClues = computed(() => locations.clues(state.value));
  const localClues = computed(() =>
    locations.clues(state.value, state.value.position),
  );
  const observation = computed(() =>
    place.value.points.find((p) => p.id === activePoint.value),
  );
  const playing = computed(() => state.value.status === "playing");
  function announce(message: string) {
    toast.value = message;
    clearTimeout(timer);
    timer = setTimeout(() => (toast.value = ""), 4500);
  }
  function persist() {
    if (!saveBlocked && !conflict)
      saveError.value = saveGame(state.value, storage);
  }
  function selectTile(id: number) {
    if (!state.value.tiles[id]) return;
    state.value.selected = id;
    persist();
  }
  function enterScene() {
    state.value.selected = state.value.position;
    activePoint.value = null;
    sceneOpen.value = true;
  }
  function leaveScene() {
    sceneOpen.value = false;
  }
  function perform(action: Action, arg?: number | ResolveMode) {
    if (conflict) {
      announce("另一页面更改了存档，请刷新后继续。");
      return;
    }
    const actionResult = engine.act(state.value, action, arg);
    if (!actionResult.ok) {
      announce(actionResult.message);
      return;
    }
    if (action === "move") enterScene();
    persist();
    announce(actionResult.message);
    if (state.value.status !== "playing") dialog.value = "ending";
    else if (state.value.pending !== null) dialog.value = "encounter";
  }
  function explore() {
    if (state.value.pending !== null) dialog.value = "encounter";
    else perform("explore");
  }
  function observePoint(id: string) {
    if (!place.value.points.some((p) => p.id === id)) return;
    if (
      (state.value.discoveries || []).includes(
        locations.key(state.value.position, id),
      )
    ) {
      activePoint.value = id;
      return;
    }
    if (conflict) {
      announce("另一页面更改了存档，请刷新后继续。");
      return;
    }
    const observation = locations.observe(state.value, id);
    if (!observation.ok) {
      announce(observation.message);
      return;
    }
    activePoint.value = id;
    if (observation.fresh) persist();
    if (observation.fresh && observation.point.clue)
      announce("已记录线索：" + observation.point.clue);
  }
  function resolveEncounter(mode: ResolveMode) {
    if (conflict) {
      announce("另一页面更改了存档，请刷新后继续。");
      return;
    }
    const actionResult = engine.act(state.value, "resolve", mode);
    if (!actionResult.ok) {
      announce(actionResult.message);
      return;
    }
    result.value = actionResult;
    persist();
    dialog.value = "result";
  }
  function continueJourney() {
    dialog.value = playing.value ? null : "ending";
  }
  function newExpedition() {
    const seed = new Uint32Array(1);
    crypto.getRandomValues(seed);
    state.value = engine.create(seed[0]);
    saveBlocked = false;
    conflict = false;
    sceneOpen.value = false;
    activePoint.value = null;
    dialog.value = null;
    persist();
    announce("新地图已经展开。从烛溪村再一次出发。");
  }
  function storageChanged(event: StorageEvent) {
    if (event.key !== SAVE_KEY) return;
    conflict = true;
    saveError.value =
      "另一页面更改了存档，请刷新以载入最新进度。当前页面已暂停行动和保存。";
    announce(saveError.value);
  }
  watch(sceneOpen, (value) => {
    if (typeof document !== "undefined")
      document.body.classList.toggle("scene-mode", value);
  });
  function dispose() {
    clearTimeout(timer);
  }
  return {
    state,
    saveError,
    sceneOpen,
    activePoint,
    dialog,
    toast,
    result,
    here,
    selected,
    place,
    currentTime,
    allClues,
    localClues,
    observation,
    playing,
    announce,
    persist,
    selectTile,
    enterScene,
    leaveScene,
    perform,
    explore,
    observePoint,
    resolveEncounter,
    continueJourney,
    newExpedition,
    storageChanged,
    dispose,
    openDialog: (kind: DialogKind) => (dialog.value = kind),
    closeDialog: () => (dialog.value = null),
  };
}
export type GameController = ReturnType<typeof createGameController>;
const gameKey: InjectionKey<GameController> = Symbol("mistbound-game");
export function provideGame() {
  let storage: SaveStorage | undefined;
  try {
    storage = window.localStorage;
  } catch {
    /* shown by loadGame */
  }
  const game = createGameController(storage);
  provide(gameKey, game);
  onMounted(() => window.addEventListener("storage", game.storageChanged));
  onBeforeUnmount(() => {
    window.removeEventListener("storage", game.storageChanged);
    game.dispose();
    document.body.classList.remove("scene-mode");
  });
  return game;
}
export function useGame() {
  const game = inject(gameKey);
  if (!game) throw new Error("Game controller was not provided");
  return game;
}
