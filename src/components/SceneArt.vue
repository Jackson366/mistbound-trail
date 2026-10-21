<script setup lang="ts">
import { computed } from "vue";
import type { Tile } from "../types";
import { get } from "../data/locations";
import { draw } from "../rendering/scene-art";
const props = withDefaults(
  defineProps<{ tile: Tile; uid: string; time?: number; preview?: boolean }>(),
  { time: 0, preview: false },
);
const markup = computed(() =>
  draw(props.tile, get(props.tile), {
    uid: props.uid,
    time: props.time,
    preview: props.preview,
  }),
);
// Only original SVG from the typed renderer enters v-html; narrative uses escaped templates.
</script>
<template><div class="scene-art-content" v-html="markup" /></template>
