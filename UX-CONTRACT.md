# Game interaction contract

Business source: PRODUCT.md. New standalone project; no existing sibling flows.

| Capability | Canonical owner                  | Source of truth | Allowed variants                       | Verification             |
| ---------- | -------------------------------- | --------------- | -------------------------------------- | ------------------------ |
| Scrollbar  | src/styles/main.css global rules | DESIGN.md       | none                                   | static audit and browser |
| Toast      | #status + announce()             | PRODUCT.md      | normal / save failure                  | browser                  |
| Dialog     | #dialog + openDialog()           | DESIGN.md       | help / pack / journal / reset / ending | browser keyboard         |

Travel requires adjacency and reveals destination and neighbors. Selection is free. Exploration is available only at the current unsearched non-camp tile. All mutations persist once after completing the action. Encounter choice blocks other mutations until resolved, but can be postponed by closing the dialog and reopened at that location. Reset destroys current expedition only after explicit native-dialog confirmation. Help, journal and inventory all preserve world state. Completed/failed expeditions disable resource mutations and retain the readable map; a new expedition is available.

Storage failure is shown persistently in the header. Corrupt saves are not silently overwritten at load; the user can start fresh via reset. No remote operations, lists, forms or asynchronous flows exist. Canonical UI rows for tables, selects, dates, forms and CRUD are inapplicable.

Scene navigation source: PRODUCT.md, second version. Enter current place → show stage, focus Return to map. Travel success → show destination stage, focus Return to map. Return to map → preserve position/resources and focus the map heading. New expedition → close scene and focus map navigation. Current place, scene and map share the existing single source of game state.

Hotspot, bottom action and clue recap share observePoint(); 1–5 shortcuts work only in scene mode without an open dialog, composition or modifier keys. Observation → update right-side detail and persist only if new; repeats show the same text without duplicating logs or costs. All observations are native buttons with labels and a visible keyboard counterpart. Final investigation calls perform('explore') and existing encounter dialog. Help, pack and journal reuse the existing dialog owner and restore focus. Pending/terminal states disable new observations/actions and show a reason; stored clues are still available in the journal.

Canonical scene ownership: SceneStage = #location-view and src/rendering/scene-art.ts, SceneObservation = observePoint in src/composables/useGame.ts, SceneContent = src/data/locations.ts, map travel = src/engine/game.ts. No equivalent screen-local interaction implementations. Both views use document scrolling; the scene narrative has no nested scroll container. Browser QA is unverified because preview permission was declined in the preceding turn; no alternate browser path is used.

Vue migration: reactive controller owned by src/composables/useGame.ts, with a typed injection key. GameDialog.vue owns modal lifecycle and restores focus; Vue templates own narrative escaping and event binding. HexMap.vue owns its ResizeObserver and disconnects it on unmount. LocationScene.vue owns and cleans up keyboard shortcuts. All content and SVG are local; there are no network-dependent game flows.

## Refactoring UI layout simplification

Source: current user instruction to make layout simple and interactions intuitive. The shared top header owns utilities, and one ResourceBar is rendered in App.vue for either view. Map location details owns a single enter/move action; formal investigation, rest is in the scene footer, and buying is offered through Mara’s conversation only. GameObjective.vue owns the identical quest explanation in both views. Observation results replace introductory prose, with an explicit return-to-introduction action. Clues and optional duplicate object buttons use native details/summary disclosures, collapsed initially and keyboard operable; original scene hotspots and numeric shortcuts remain accessible. On narrow screens, selecting an object scrolls to its result. Focus after map return goes to the map heading; modal fallback focus targets existing shared navigation or scene-back controls.

The layout-only revision did not change engine rules. The conversation revision below adds an optional version-1 memory extension. Browser visual verification remains unavailable under the previously declined preview permission; component tests cover transitions, single resource/primary-action ownership, disclosure defaults and observation/intro switching.

## Conversation interaction

Source: current user instruction to implement Refactoring UI together with Deibel conversation design. All seven NPCs share `ConversationPanel.vue`, `engine/conversation.ts` and the authored `data/dialogues.ts`. These own non-modal conversation presentation, validated transitions and character content respectively. `useGame.ts` owns orchestration, persistence and conflict blocking; the existing shared toast owner reports rejected/stale actions. `engine/game.ts` remains the only owner of purchases and resource arithmetic.

| Trigger                     | Result and feedback                                               | Recovery                                                              |
| --------------------------- | ----------------------------------------------------------------- | --------------------------------------------------------------------- |
| Select an NPC               | Start or resume the saved reply; no cost and no automatic clue    | Select another point or return to map freely                          |
| Choose a topic              | Short reply; the first topic records that NPC’s clue once         | Return to the topic menu or end the conversation                      |
| Buy four supplies           | Explicit 3-gold / 4-supply choice, followed by a separate receipt | Receipt has no purchase action; reopen menu deliberately to buy again |
| Insufficient gold           | Exact shortage and no-charge notice; reply remains usable         | Free topic and exit remain available                                  |
| End conversation            | Farewell, no action cost                                          | Reopen with a shorter contextual greeting                             |
| Leave temporarily or reload | Last node, reply, topics and receipt remain in local save         | Re-select the NPC to resume without replaying a greeting              |

Each node has no more than three response buttons, including an exit. The current reply receives programmatic focus after a choice so removing a response button does not strand keyboard focus. Cross-tab conflict, pending encounters and terminal expeditions block conversation mutations as they block other game actions. Encounter choices use one full-width button per option, with all costs and probabilities inside the button. There is no free-text input, typing simulation, model call or new remote data flow.

The optional `conversations` record accepts only seven authored NPC keys, valid nodes, bounded revisions, unique topic indices and up to twelve recent turns per NPC. Old saves remain valid without it. Reset clears all conversation memory. Context uses only explicit expedition progress (Oren when back in the village), empty supplies (Mara) and the NPC’s own previous topics; other characters do not claim knowledge of unseen actions.

Verification: Node engine/controller tests and Vue components in JSDOM exercise all NPCs, first/repeat topics, price arithmetic, insufficient funds, stale purchases, interruption/reload, returning greetings, keyboard focus and conflict guards. Browser visual/responsive checks remain unverified under the earlier declined preview permission.
