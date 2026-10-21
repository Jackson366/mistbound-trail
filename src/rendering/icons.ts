const paths: Record<string, string> = {
  forest:
    '<path d="M15 44V29m-11 5 11-22 11 22H4Zm35 10V21m-14 8L39 2l14 27H25Zm18 15V34m-9 5 9-18 9 18H48Z"/>',
  plain:
    '<path d="M2 43q12-15 28-5 17-19 32-2M13 41l-3-13m3 9 5-8m17 9-2-16m2 10 6-8m14 16 3-15"/>',
  hill: '<path d="M1 43 22 12l20 31M23 43 46 7l18 36M14 25l8 5 7-6M38 22l8 5 6-4"/>',
  mountain:
    '<path d="m0 44 20-34 17 34m-11 0L46 1l20 43M12 24l8 5 6-8M38 17l8 6 5-10"/>',
  marsh:
    '<path d="M2 37q7-5 14 0t14 0 14 0 18 0M6 45q8-5 17 0t17 0 17 0M18 31V9m0 13-7-6m7 0 6-7m18 23V5m0 13-6-6m6 2 7-6"/>',
  settlement:
    '<path d="M5 42V23L20 9l15 14v19H5Zm30 0V18l11-9 14 12v21H35ZM3 23h34M16 42V29h9v13m15-22h17m-15 8h9m-41-5v-9"/>',
  tower:
    '<path d="M19 44V13h28v31M15 13l18-12 18 12M23 13v5m9-5v5m10-5v5M28 44V31h10v13M26 23h4m7 0h4M14 44h40"/>',
  abbey:
    '<path d="M7 44V20l15-9 12 9v24M34 44V14l12-8 12 8v30M3 44h61M42 7V0m-4 4h8M16 44V31h10v13m-2-22h-5m23-3h9m-9 8h9"/>',
  castle:
    '<path d="M5 44V12h7v7h7v-7h8v32m10 0V12h8v7h7v-7h8v32M27 24h10M27 44V32h10v12M1 44h63M10 29h7m28 0h7"/>',
  dungeon:
    '<path d="M3 44 10 20l14-14 22 5 16 33H3Zm16 0V29q13-24 26 0v15M26 34h12m-12 7h12M8 21l9 5m28-11-5 8"/>',
  landmark:
    '<path d="m14 43 4-34 14-7 12 10 5 31M10 44h44M26 17l9-3-4 8 7 5-11 7m-7 9 2-9m18 8-1-10"/>',
  lair: '<path d="M3 44 13 20 32 8l19 12 12 24H3Zm15-1 3-17 12-7 12 7 4 17M26 31l4 1m8-1 4 1"/>',
  fog: '<path d="M4 16h33q15 0 15 8T36 32H8m10 9h36M12 6h21"/>',
};
export function icon(key: string) {
  return `<svg viewBox="0 0 66 50" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[key] || paths.landmark}</svg>`;
}
