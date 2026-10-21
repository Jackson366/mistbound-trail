---
version: alpha
name: 雾境行旅
description: 一张逐步显现的边境地图，承载短篇沙盒远征。
colors:
  background: "#101e27"
  surface: "#192b34"
  primary: "#d4b675"
  text: "#e7e8de"
  muted: "#a6b8bb"
  success: "#a2c6ae"
  danger: "#e3a49a"
  scene-bg: "#0d1915"
  scene-panel: "#101e19"
  scene-border: "#304239"
  scene-text: "#dfdfc8"
  scene-muted: "#b2b8a3"
  scene-accent: "#d5b675"
typography:
  display:
    fontFamily: "Songti SC, SimSun, serif"
  body:
    fontFamily: "PingFang SC, Microsoft YaHei, sans-serif"
  mono:
    fontFamily: "ui-monospace, monospace"
rounded:
  DEFAULT: "8px"
spacing:
  panel: "28px"
components:
  button:
    rounded: "{rounded.DEFAULT}"
  dialog:
    rounded: "{rounded.DEFAULT}"
---

# 雾境行旅

## Overview

A playable Chinese solo hex expedition with a separate scene view at every location. Product register, aimed at a Chinese-speaking desktop player, with mobile support. No Japan-market business behavior. Physical reference: a surveyor's slate-blue field map, engraved pine trees and brass compass. Signature: nineteen terrain hexes emerging from fog. Avoid a dashboard of metric cards or a fantasy shop homepage.

Runtime tokens are canonical in src/styles/main.css :root (Model B). Above colors map one-to-one to --background, --surface, --primary, --text, --muted, --success, --danger. Typography maps to --display, --body, --mono. All shared controls consume these variables; no theme adapter.

## Colors

Slate-blue surfaces support muted sage terrain. Brass is reserved for the expedition marker and primary action. Health loss uses danger plus text. Selected hexes have a brass perimeter; current location also has a pin and text. Scrollbars use muted thumbs on background with primary hover; forced colors delegates to system colors.

Scene surfaces extend the palette with forest-black, sage text, warm brass and wood interiors inspired by the user-provided tavern reference. `colors.scene-*` map directly to the same-named CSS variables. Illustration palettes remain scene-specific, not application control tokens.

## Typography

Chinese serif display titles evoke a travel journal; Chinese sans body remains readable at 14–16px and 1.7 line-height. Monospace is for coordinates, seed and time. System fonts avoid network-dependent swaps.

## Layout

Desktop: 80px tool rail, flexible central map/journal, 330px location panel. Below 1100px the rail becomes a labeled horizontal toolbar. Below 800px location details follow the map in document flow. Map scales at a fixed aspect ratio; document owns scrolling.

Location mode: artwork and semantic HTML hotspots fill the flexible left stage; a 350px story column contains objective, observations and collected clues. A bottom action tray duplicates every hotspot for keyboard/touch access. Below 850px the narrative moves beneath the stage; below 520px the action tray wraps into large labeled controls. The scene canvas preserves 12:7 coordinates, preventing hotspot drift. Scene panels retain independent overflow only on desktop.

## Elevation & Depth

Map grid and tonal land layers create depth. No card shadow stacks. Dialogs use a dark backdrop, and static panels use thin borders.

## Shapes

Pointed hexagons belong only to the map. Buttons and dialogs use 8px corners. Native buttons remain keyboard operable with focus rings.

## Components

One button primitive for primary, secondary and ghost; disabled states reduce contrast and include reasons in adjacent text. One native dialog owner for help, pack, journal, reset and endings, with showModal focus containment, Escape and restored focus. One live status owner communicates actions and save failures. No loading state: the entire game runs locally synchronously. No server or external API.

Iconography uses original inline line drawings. Hover brightens controls; focus has a 2px brass ring. No ambient animation. Reduced motion disables transitions. All action labels are Chinese. Map buttons include coordinates and location names in accessible labels.

Scene artwork is owned by src/rendering/scene-art.ts; authored people and clues by src/data/locations.ts; scene transitions and focus by src/composables/useGame.ts. Hotspot, action-tray and clue-recap buttons invoke the same observePoint handler. Scenery has no network or image dependencies.

## Do's and Don'ts

- Do make movement cost visible before moving.
- Do keep exploration and movement separate actions.
- Don't reveal hidden contents before reaching a location.
- Don't require hover or color alone to understand the map.
