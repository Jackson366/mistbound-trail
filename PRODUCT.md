# 雾境行旅 — 第一版

The user's brief asks for a game using Sandbox Generator experience. This version is a browser-local Chinese solo exploration game.

The book supplies layered generation, 19 hex snowflake size, biome inertia, feature generation and empty sites as information. Its method generates situations, not a combat system. The following are original adaptations: HP 12, starting supplies 10 and gold 18; each move costs one time and one supply; at zero supply a move costs 2 HP; explore costs one time; rest outside costs one supply and recovers 4 HP; camp rest costs two time and recovers all HP; supplies at camp cost 3 gold for 4 supplies. Three deliberately placed sigils guarantee a reachable completion condition. Find them and return to the village. Risky exploration rolls a d6: 4–6 grants reward without harm, 1–3 grants reward with 3 damage; cautious exploration spends two time and one supply, or takes two harm if supplies are empty, avoiding the die. No turn advances on selection, help or pack.

Factions derive from castle/tower/abbey, never the starting village. Main expedition content is original prose, not reproduced tables. World generation uses seeded randomness; action rolls use a saved evolving RNG. Local save uses a versioned slot, validated before load; corruption is recoverable through a new expedition. Fresh seed resets the entire world, after confirmation. Local save has no cloud synchronization. No account data or integrations are used.

## 地点场景 — 第二版

User-supplied tavern screenshot is the design reference: large original illustrated stage with clickable people/objects, a right-side narrative and clue log, and a bottom action tray. Keep existing map and expedition rules. Every one of 19 locations has authored atmosphere, two opening paragraphs and 3–5 observations (59 total). Shared scene renderers draw specific objects and NPCs; settlement/biome/feature remain the seeded map's source of truth. Tavern, altar, crypt, tower, abbey and gate are authored landmark scenes, not additional map factions.

Arrival opens the scene view; the current tile also has an explicit entry button. Returning to the map costs no resources. Talking and examining only record lore, cost no time or supplies, and never award repeatable resources. The separate formal investigation action invokes the existing explore/encounter flow, exactly once per tile. Core objects reveal their observation; the scene footer owns the formal-investigation action. Pending encounters must be resolved before new observations; completed observations remain readable through the clue recap and full journal. No scene interaction changes faction reputation or adds unimplemented quest requirements.

Old version-1 saves remain accepted: discoveries is optional and defaults to an empty list. New discoveries persist in the same slot; invalid keys and duplicates are rejected. Scene selection itself is transient, and reset clears observations along with the expedition. All content is original writing and original vector illustration; no screenshot artwork or watermark is reused.

## Vue 3 + TypeScript migration

User explicitly selected Vue 3 + TypeScript (superseding the brief React message) and requested a private GitHub source repository. Maintain gameplay and original artwork, extract typed engine/data/rendering modules, and build actual Vue SFCs with Composition API. Existing save key and schema stay compatible. Vite builds static dist output; no backend, paid services or model integration is added.

## 简洁布局与直观交互

Keep the established slate/brass visual identity and original scene artwork. Remove the promotional hero, left rail and repeated status/quest/journal content. Use one shared utility header and resource bar, map selection + concise destination details, and scene hotspots + one clear action area. Preserve all observations through direct hotspots, a collapsed keyboard/touch alternative and the journal. Observation/intro switching and native disclosures reduce competing prose without deleting story content. This is a presentation and navigation change; resource costs, rewards, terminal states and saves remain unchanged.
