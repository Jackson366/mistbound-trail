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
  panel: "24px"
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

Both views share one header and one compact resource bar. The header owns journal, inventory, help and new expedition. Maximum content width is 1360px, horizontal padding 32px desktop / 16px phone, with 24–32px between major groups. Body uses 12–15px, section headings 17px, scene/page headings 23–28px. Color, weight and whitespace establish hierarchy; no promotional hero, left navigation rail or repeated journal/quest panels.

Map: flexible map + fixed 300px location column, reduced to 280px before stacking below 800px. Selected location shows one primary action: enter current place or move to an adjacent tile, with cost/reason directly beneath. Investigation, buying supplies and rest belong only to the scene. Mobile hides the secondary preview illustration and retains concise text and the primary button. The document owns scrolling.

Scene: a single vertical layout at every viewport width, capped at 1120px. The upper region owns only the illustrated scene and its native hotspots at their original 12:7 coordinates. The lower region owns dialogue, observations and actions. It is a full-width forest surface with 24px padding (18px / 16px on phones), while its reading content is capped at 760px. Current dialogue or observation comes first, followed by the secondary scene action tray; clues and the expedition goal are separate collapsed disclosures. There is no narrative sidebar or breakpoint that restores one. Global resources, utilities and scene heading retain their established owners. The document owns scrolling. Selecting a point brings the lower narrative into view at every width.

Conversations are a visible exchange, not a replacement article. A compact header pairs a 40px monogram with a 20px serif name and a 12px role. NPC bubbles align left in forest surfaces; player bubbles align right in slate with a brass border. Names and alignment distinguish speakers without relying only on color. Bubble text is 15px sans at 1.85 line-height, with mirrored 3px lower corners and 12px remaining corners. The latest five turns stay visible in order; earlier retained turns expand above the thread. Receipts and clues sit outside the speech bubble beside their originating NPC turn. The latest reply receives focus and the response area follows in document flow at every width. Bubble width is capped at 34rem and 88% of the reading area to keep alternating speakers readable in the wider lower region.

A quiet reply area follows the thread: at most three native response buttons, no dummy text input. Free replies are text choices; the purchase retains its visible price and brass outline. Exit is tertiary. Choices append the player's actual words before the NPC response. Continuing to another topic uses a short linking cue rather than a repeated greeting. No typing delay or decorative animation. Native buttons remain at least 44px high and wrap their text. Encounter choices retain their established full-width risk/cost layout. Existing slate/forest/brass tokens remain canonical; no new color tokens or typography dependencies.

## Elevation & Depth

Map grid and tonal land layers create depth. No card shadow stacks. Dialogs use a dark backdrop, and static panels use thin borders.

## Shapes

Pointed hexagons belong only to the map. Buttons and dialogs use 8px corners. Native buttons remain keyboard operable with focus rings.

## Components

One button primitive for primary and secondary; utilities are tertiary text buttons; disabled states reduce contrast and include reasons in adjacent text. One native dialog owner for help, pack, journal, reset and endings, with showModal focus containment, Escape and restored focus. One live status owner communicates actions and save failures. No loading state: the entire game runs locally synchronously. No server or external API.

Iconography uses original inline line drawings. Hover brightens controls; focus has a 2px brass ring. No ambient animation. Reduced motion disables transitions. All action labels are Chinese. Map buttons include coordinates and location names in accessible labels.

Scene artwork is owned by src/rendering/scene-art.ts; authored people and clues by src/data/locations.ts, branching scripts by src/data/dialogues.ts; scene transitions and focus by src/composables/useGame.ts. Hotspot, collapsed object-list and clue-recap buttons invoke the same observePoint handler. GameObjective.vue is shared by map and scene. Native details/summary owns disclosure keyboard semantics; dialogs remain in GameDialog.vue. Scenery has no network or image dependencies.

## Do's and Don'ts

- Do show only one primary action per work area and keep resource costs next to it.
- Do make movement cost visible before moving.
- Do keep exploration and movement separate actions.
- Don't reveal hidden contents before reaching a location.
- Don't require hover or color alone to understand the map.
