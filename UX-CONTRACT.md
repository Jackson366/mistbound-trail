# Game interaction contract

Business source: PRODUCT.md. New standalone project; no existing sibling flows.

| Capability | Canonical owner                  | Source of truth | Allowed variants                       | Verification             |
| ---------- | -------------------------------- | --------------- | -------------------------------------- | ------------------------ |
| Scrollbar  | src/styles/main.css global rules | DESIGN.md       | none                                   | static audit and browser |
| Toast      | #status + announce()             | PRODUCT.md      | normal / save failure                  | browser                  |
| Dialog     | #dialog + openDialog()           | DESIGN.md       | help / pack / journal / reset / ending | browser keyboard         |

Travel requires adjacency and reveals destination and neighbors. Selection is free. Exploration is available only at the current unsearched non-camp tile. All mutations persist once after completing the action. Encounter choice blocks other mutations until resolved, but can be postponed by closing the dialog and reopened at that location. Reset destroys current expedition only after explicit native-dialog confirmation. Help, journal and inventory all preserve world state. Completed/failed expeditions disable resource mutations and retain the readable map; a new expedition is available.

Storage failure is shown persistently in the header. Corrupt saves are not silently overwritten at load; the user can start fresh via reset. No remote operations, lists, forms or asynchronous flows exist. Canonical UI rows for tables, selects, dates, forms and CRUD are inapplicable.

Scene navigation source: PRODUCT.md, second version. Enter current place → show stage, focus Return to map. Travel success → show destination stage, focus Return to map. Return to map → preserve position/resources and focus the entry button. New expedition → close scene and focus map navigation. Current place, scene and map share the existing single source of game state.

Hotspot, bottom action and clue recap share observePoint(); 1–5 shortcuts work only in scene mode without an open dialog, composition or modifier keys. Observation → update right-side detail and persist only if new; repeats show the same text without duplicating logs or costs. All observations are native buttons with labels and a visible keyboard counterpart. Final investigation calls perform('explore') and existing encounter dialog. Help, pack and journal reuse the existing dialog owner and restore focus. Pending/terminal states disable new observations/actions and show a reason; stored clues are still available in the journal.

Canonical scene ownership: SceneStage = #location-view and src/rendering/scene-art.ts, SceneObservation = observePoint in src/composables/useGame.ts, SceneContent = src/data/locations.ts, map travel = src/engine/game.ts. No equivalent screen-local interaction implementations. Desktop story column scrolls internally; mobile returns to document scrolling. Browser QA is unverified because preview permission was declined in the preceding turn; no alternate browser path is used.

Vue migration: reactive controller owned by src/composables/useGame.ts, with a typed injection key. GameDialog.vue owns modal lifecycle and restores focus; Vue templates own narrative escaping and event binding. HexMap.vue owns its ResizeObserver and disconnects it on unmount. LocationScene.vue owns and cleans up keyboard shortcuts. All content and SVG are local; there are no network-dependent game flows.
