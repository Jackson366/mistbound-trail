import type { GameState } from "../types";
import { create, validate } from "./game";
export const SAVE_KEY = "mistbound-expedition-v1";
export interface SaveStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}
export interface LoadResult {
  state: GameState;
  error: string;
  blocked: boolean;
}
export function loadGame(storage?: SaveStorage): LoadResult {
  const fallback = create(728491);
  if (!storage)
    return {
      state: fallback,
      error: "浏览器存储不可用，本次进度仅在当前页面保留。",
      blocked: true,
    };
  try {
    const raw = storage.getItem(SAVE_KEY);
    if (!raw) return { state: fallback, error: "", blocked: false };
    const value: unknown = JSON.parse(raw);
    if (!validate(value))
      return {
        state: fallback,
        error: "存档无法读取；可开启新旅程恢复保存。",
        blocked: true,
      };
    value.discoveries ??= [];
    return { state: value, error: "", blocked: false };
  } catch {
    return {
      state: fallback,
      error: "无法读取本地存档；可开启新旅程重新尝试。",
      blocked: true,
    };
  }
}
export function saveGame(state: GameState, storage?: SaveStorage): string {
  try {
    if (!storage) throw new Error("unavailable");
    storage.setItem(SAVE_KEY, JSON.stringify(state));
    return "";
  } catch {
    return "保存失败：浏览器存储不可用，本次进度仅在当前页面保留。";
  }
}
