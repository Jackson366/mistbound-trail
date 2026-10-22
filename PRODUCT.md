# 雾境行旅 — 第一版

The user's brief asks for a game using Sandbox Generator experience. This version is a browser-local Chinese solo exploration game.

The book supplies layered generation, 19 hex snowflake size, biome inertia, feature generation and empty sites as information. Its method generates situations, not a combat system. The following are original adaptations: HP 12, starting supplies 10 and gold 18; each move costs one time and one supply; at zero supply a move costs 2 HP; explore costs one time; rest outside costs one supply and recovers 4 HP; camp rest costs two time and recovers all HP; supplies at camp cost 3 gold for 4 supplies. Three deliberately placed sigils guarantee a reachable completion condition. Find them and return to the village. Risky exploration rolls a d6: 4–6 grants reward without harm, 1–3 grants reward with 3 damage; cautious exploration spends two time and one supply, or takes two harm if supplies are empty, avoiding the die. No turn advances on selection, help or pack.

Factions derive from castle/tower/abbey, never the starting village. Main expedition content is original prose, not reproduced tables. World generation uses seeded randomness; action rolls use a saved evolving RNG. Local save uses a versioned slot, validated before load; corruption is recoverable through a new expedition. Fresh seed resets the entire world, after confirmation. Local save has no cloud synchronization. No account data or integrations are used.

## 地点场景 — 第二版

User-supplied tavern screenshot is the design reference: large original illustrated stage with clickable people/objects, a narrative and clue log (moved below the stage by the later vertical-layout instruction), and a bottom action tray. Keep existing map and expedition rules. Every one of 19 locations has authored atmosphere, two opening paragraphs and 3–5 observations (59 total). Shared scene renderers draw specific objects and NPCs; settlement/biome/feature remain the seeded map's source of truth. Tavern, altar, crypt, tower, abbey and gate are authored landmark scenes, not additional map factions.

Arrival opens the scene view; the current tile also has an explicit entry button. Returning to the map costs no resources. Talking and examining record lore and cost no time or supplies. Explicit paid purchases in the conversation revision below use the existing camp exchange rule. The separate formal investigation action invokes the existing explore/encounter flow, exactly once per tile. Core objects reveal their observation; the scene footer owns the formal-investigation action. Pending encounters must be resolved before new observations; completed observations remain readable through the clue recap and full journal. No scene interaction changes faction reputation or adds unimplemented quest requirements.

Old version-1 saves remain accepted: discoveries is optional and defaults to an empty list. New discoveries persist in the same slot; invalid keys and duplicates are rejected. Scene selection itself is transient, and reset clears observations along with the expedition. All content is original writing and original vector illustration; no screenshot artwork or watermark is reused.

## Vue 3 + TypeScript migration

User explicitly selected Vue 3 + TypeScript (superseding the brief React message) and requested a private GitHub source repository. Maintain gameplay and original artwork, extract typed engine/data/rendering modules, and build actual Vue SFCs with Composition API. Existing save key and schema stay compatible. Vite builds static dist output; no backend, paid services or model integration is added.

## 简洁布局与直观交互

Keep the established slate/brass visual identity and original scene artwork. Remove the promotional hero, left rail and repeated status/quest/journal content. Use one shared utility header and resource bar, map selection + concise destination details, and scene hotspots + one clear action area. Preserve all observations through direct hotspots, a collapsed keyboard/touch alternative and the journal. Observation/intro switching and native disclosures reduce competing prose without deleting story content. This is a presentation and navigation change; resource costs, rewards, terminal states and saves remain unchanged.

## 分支对话与操作反馈

Implement the user-approved conversation-design advice together with the simplified layout. All seven NPCs now have short authored branches, with two or three player responses per node including an exit. Each NPC has a practical purpose and consistent voice: Mara handles supplies and return provisions; Oren explains locations and the expedition goal; the courier describes the scholar; Sain preserves ordinary names; Leia explains road customs; Venn interprets the sigils; Ada teaches trail signs and camp preparation.

Mara offers the existing exchange of 3 gold for 4 supplies through an explicitly priced response. Browsing, leaving and lore questions remain free; buying adds no time cost. A receipt separates resource changes from dialogue. Insufficient funds show the exact shortage without charging or trapping the player. Purchase dispatch is guarded by the current node and revision so a repeated stale choice cannot charge twice. Reopening the menu explicitly permits another purchase.

Conversation history and cursor are optional version-1 save fields. Keep only the most recent twelve turns per NPC plus visited topics. Temporary interruption resumes the same reply; a deliberate farewell allows a shorter contextual greeting on return. This remains browser-local game state and is cleared by a new expedition. Existing static clues and version-1 saves remain compatible. The clue is recorded only after the relevant first topic, once. No persuasion rolls, reputation, extra quest gates or generative dialogue are added.

## 连续气泡对话

Respond to the user’s request for an actual dialogue-bubble feel. Show recent NPC and player utterances together, with opposing alignment and explicit speaker names. Keep the latest five messages visible and older retained messages available above them. The reply area contains actual available responses; choosing one appends the player’s words and the authored NPC reply. Preserve receipts beside the turn that produced them. Topic continuation should sound like continuing the same conversation, without repeating a greeting. This is a presentation and authored-copy change, with an optional per-turn notice for compatible persistence; existing prices, outcomes and exploration rules do not change.

## 上下分区

The user explicitly requires upper/lower regions and rejects dialogue in a sidebar. At every screen width the upper section is the scene picture; the lower section contains conversation or observation, then scene actions. Keep clues and the current goal available in collapsed disclosures below. Preserve the bubble dialogue, artwork coordinates, free point selection, action costs and save compatibility. Point selection must bring the lower narrative into view on desktop as well as mobile.

## 线索、人物回应与归途 — 第四版

来源：用户在 2026-10-22 明确要求完整落实玩法、NPC 对话、探索节奏三项评审建议。本节替代此前“规则不变”“没有额外解法”“回村立即通关”等旧版约束，保留既有上下布局和本地存档。

- 正式调查仍花费 1 时段。三处印记保留冒险掷骰和谨慎绕行，并新增由观察解锁的独立解法：祭坛需辨认松林或祭坛的归乡刻痕并查看基座，对齐星盘无需额外费用；墓窟需查看浮雕和空盘，归还供物花费 1 金币、1 时段；孤塔需读无字书或询问维恩的墨迹，并查看星仪，等待停顿花费 2 时段、不消耗物资。三者都不受伤，照常获得印记和 4 金币。费用、缺少的证据在提交前显示，规则层重新验证。重复执行不重复收费或发奖。
- 遭遇允许“先退回查看线索”。撤回不退还已花的调查时段，再次调查仍花费 1 时段；缺线索不造成死锁。时间记录旅程长短，没有倒计时或隐藏惩罚。
- 查看灰松林苦艾围巾或听艾达讲路标后，在灰松林或野鹿营地休整可恢复最多 6 生命，费用仍为 1 补给、2 时段；其他野外地点仍恢复最多 4 生命。
- 人物对话支持直接接续另一个话题，每轮含退出最多三项。玛拉的重复购买仍需显式返回商品菜单，保留价格、收据与过期选择防重。奥伦根据实际取回地点回应进展，玛拉欢迎携三印记的归人；未道别的对话在相关旅程状态变化后追加新的回应，普通中断仍原样续聊。
- 信使的星纹信 → 维恩托付口信 → 回村向信使转达，是可完成且不收费的支线。不会因未完成支线阻止主线结束。手记保存口信进展，结尾按已完成／尚未转达给出不同回应。
- 三处古迹从辨认方向、理解归还、掌握机关形成不同的行动与信息层次，不强制访问顺序。目标提供轻量的下一段路建议；场景取消“已查看 X/Y”的全清提示，保留热点记录和可回看线索。取回印记后，地点开场与核心物件切换为事后描述。
- 集齐印记回村保持 playing，允许欢迎、补给与支线对话；必须在奥伦对话中明确选择交还星盘才置为 won。结算回应采用过的线索解法和口信结果。既有 won 存档保持已完成。新字段 insightSites、letterStage 和对话 context 为可选扩展，旧版存档继续有效。
