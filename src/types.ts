export type Biome = "plain" | "forest" | "hill" | "marsh" | "mountain";
export type Feature =
  | "landmark"
  | "settlement"
  | "lair"
  | "dungeon"
  | "tower"
  | "abbey"
  | "castle";
export type Content = "camp" | "hazard" | "empty" | "special" | "monster";
export type Action = "move" | "explore" | "resolve" | "rest" | "buy";
export type ResolveMode = "bold" | "careful";
export interface Coordinate {
  q: number;
  r: number;
}
export interface Tile extends Coordinate {
  id: number;
  name: string;
  biome: Biome;
  feature: Feature;
  nature: string;
  content: Content;
  searched: boolean;
  visible: boolean;
  visited: boolean;
  sigil: boolean;
  faction: string | null;
}
export interface LogEntry {
  time: number;
  text: string;
  locationId?: number;
}
export interface GameState {
  version: 1;
  seed: number;
  randomState: number;
  tiles: Tile[];
  position: number;
  selected: number;
  hp: number;
  food: number;
  gold: number;
  sigils: number;
  time: number;
  status: "playing" | "won" | "lost";
  pending: number | null;
  discoveries?: string[];
  conversations?: Record<string, ConversationMemory>;
  logs: LogEntry[];
}
export interface DialogueTurn {
  role: "npc" | "player";
  text: string;
}
export interface ConversationMemory {
  node: "menu" | "topic0" | "topic1" | "receipt" | "end";
  revision: number;
  topics: number[];
  history: DialogueTurn[];
  notice: string;
}
export interface ActionResult {
  ok: boolean;
  message: string;
  die?: number | null;
  damage?: number;
}
export type PointKind = "talk" | "inspect" | "core";
export type SceneKind =
  | "tavern"
  | "altar"
  | "crypt"
  | "tower"
  | "abbey"
  | "gate"
  | "camp"
  | "den"
  | "water"
  | "pass"
  | "woodland"
  | "moor";
export type PointTuple = [
  id: string,
  label: string,
  kind: PointKind,
  x: number,
  y: number,
  title: string,
  text: string,
  clue: string | null,
];
export interface LocationProfile {
  title: string;
  subtitle: string;
  air: string;
  intro: string[];
  points: PointTuple[];
}
export interface LocationPoint {
  id: string;
  label: string;
  kind: PointKind;
  x: number;
  y: number;
  title: string;
  text: string;
  clue: string | null;
}
export interface Place extends Omit<LocationProfile, "points"> {
  points: LocationPoint[];
  kind: SceneKind;
}
export interface Clue extends LocationPoint {
  locationId: number;
  key: string;
}
export type ObservationResult =
  | { ok: false; message: string }
  | { ok: true; fresh: boolean; point: LocationPoint; key: string };
