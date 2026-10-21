import type { Biome, Place, SceneKind, Tile } from "../types";
type Palette = [string, string, string, string];
export const palette: Record<Biome, Palette> = {
  forest: ["#263c38", "#182c2a", "#375243", "#6a7857"],
  plain: ["#3d4b43", "#283c35", "#66705a", "#94946e"],
  hill: ["#3d4844", "#283735", "#5a6758", "#8c8d70"],
  marsh: ["#2c4447", "#182e33", "#46635a", "#879582"],
  mountain: ["#3c4c54", "#26343e", "#657373", "#a4aca1"],
};
const rect = (
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string,
  extra = "",
) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" ${extra}/>`;
function person(
  x: number,
  y: number,
  s: number,
  coat = "#49594d",
  hair = "#40362d",
  skin = "#c49970",
  book = false,
) {
  return `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="18" rx="40" ry="10" fill="#000" opacity=".25"/><path d="M-34 10q-6-71 20-91h28q28 17 25 91Z" fill="${coat}"/><path d="M-15-83v-18h30v18" fill="${skin}"/><ellipse cy="-118" rx="24" ry="28" fill="${skin}"/><path d="M-25-116q-3-36 24-33t27 29l-16-11-18-4Z" fill="${hair}"/><path d="m-24-65-12 58m62-58 12 50" stroke="${coat}" stroke-width="16" stroke-linecap="round"/>${book ? '<path d="m-25-21 24-7 26 7v29L0 1l-25 7Z" fill="#ad9770"/><path d="M0-27V1m-18-14 12-3m12 0 12 3" stroke="#ded1ab" fill="none"/>' : ""}<path d="M-16 11v20m33-20v20" stroke="#252c29" stroke-width="15"/></g>`;
}
function tree(x: number, y: number, s: number, c = "#263f32", pine = false) {
  return `<g transform="translate(${x} ${y}) scale(${s})">${rect(-7, -170, 14, 177, "#463d2e")}${pine ? `<path d="M0-282-65-156h29l-68 108h208L36-156h29Z" fill="${c}"/>` : `<path d="M0-216q-88-76-101 21-60 52 9 93l78 17 88-11q75-41 30-109-10-80-104-11Z" fill="${c}"/><path d="m0-156-35-34m35 64 40-45" stroke="#3f4932" stroke-width="7" fill="none"/>`}</g>`;
}
function rock(x: number, y: number, s = 1, c = "#59645a") {
  return `<g transform="translate(${x} ${y}) scale(${s})"><path d="m-52 18 8-50 42-24 42 18 20 53Z" fill="${c}"/><path d="m-44-32 39 17 45-23M-5-15l-8 32" stroke="#c0c6ae" stroke-opacity=".13" fill="none"/></g>`;
}
function note(x: number, y: number, rotation = 0) {
  return `<g transform="translate(${x} ${y}) rotate(${rotation})">${rect(-24, -30, 48, 59, "#cabe99")}<circle cy="-23" r="2" fill="#755338"/><path d="M-16-13h32m-32 9h27m-27 9h32m-32 9h21" stroke="#92825e" stroke-width="1.5"/></g>`;
}
function bottle(x: number, y: number, c: string, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})">${rect(-7, -35, 14, 38, c, 'rx="4"')}${rect(-3, -45, 6, 13, c)}<path d="M-2-29v20" stroke="#ddd" opacity=".08"/></g>`;
}
function flame(x: number, y: number, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cy="12" rx="52" ry="10" fill="#7b381c"/><path d="M-32 6q-4-43 21-80-6 40 13 43 14-19 9-34 42 46 23 71Z" fill="#c97530"/><path d="M-18 6q-5-28 11-43-4 21 8 23l9-17q15 22 8 37Z" fill="#e2b457"/></g>`;
}
function lantern(x: number, y: number, uid: string, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})"><circle cy="17" r="65" fill="url(#${uid}-glow)"/>${rect(-13, -8, 26, 44, "#302b21", 'rx="4"')}${rect(-9, 1, 18, 25, "#d6b86e")}<path d="M-17-9h34M-17 37h34M-6-12v-9h12v9" stroke="#7d7252" fill="none"/></g>`;
}
function table(x: number, y: number, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cy="70" rx="85" ry="17" fill="#000" opacity=".2"/>${rect(-8, 0, 16, 86, "#4c3526")}<ellipse ry="24" rx="91" fill="#694c33"/><ellipse cy="-5" ry="20" rx="83" fill="#886644"/><path d="M-67-8q65 11 132 0" stroke="#c0a276" opacity=".12" fill="none"/></g>`;
}
function arch(
  x: number,
  y: number,
  w: number,
  h: number,
  fill = "#121e1d",
  frame = "#5e6556",
) {
  return `<path d="M${x} ${y + h}V${y + w / 2}a${w / 2} ${w / 2} 0 0 1 ${w} 0V${y + h}Z" fill="${fill}" stroke="${frame}" stroke-width="18"/>`;
}
function star(x: number, y: number, s = 1, c = "#c5b976") {
  return `<g transform="translate(${x} ${y}) scale(${s})" fill="none" stroke="${c}" stroke-width="2"><path d="m0-20 5 14 15 6-15 5-5 15-5-15-15-5 15-6Z"/><circle r="30" opacity=".4"/></g>`;
}
function tavern(uid: string) {
  let out =
    rect(0, 0, 1200, 700, "#251e17") + rect(60, 40, 1080, 500, "#30251c");
  for (const x of [160, 470, 820, 1060]) out += rect(x, 25, 22, 530, "#201c17");
  out += rect(0, 0, 1200, 35, "#181915") + rect(70, 530, 1060, 170, "#211b15");
  for (let i = 0; i < 8; i++)
    out += `<path d="M${-200 + i * 220} 700 600 260" stroke="#5b4029" opacity=".25"/>`;
  for (const y of [580, 642, 698])
    out += `<path d="M40 ${y}h1120" stroke="#695037" opacity=".25"/>`;
  // Open door and signs.
  out +=
    rect(65, 230, 123, 300, "#171912", 'rx="3"') +
    rect(76, 240, 102, 282, "#392a1a") +
    `<path d="m176 255 23 17v240l-23 12Z" fill="#294036"/>` +
    rect(79, 297, 95, 8, "#201b12") +
    rect(79, 421, 95, 8, "#201b12") +
    '<circle cx="157" cy="377" r="4" fill="#bb9852"/>';
  // Shelves and bottles.
  for (const y of [128, 239, 335]) {
    out += rect(214, y, 275, 12, "#62472d", 'rx="3"');
    for (let i = 0; i < 8; i++)
      out += bottle(
        235 + i * 32,
        y - 1,
        ["#4b6144", "#85643d", "#734c3c", "#425961", "#696d46", "#744a59"][
          (i + y) % 6
        ],
        0.8 + (i % 3) * 0.15,
      );
  }
  // Hearth.
  out +=
    rect(525, 180, 246, 323, "#555044", 'rx="6"') +
    rect(513, 172, 270, 23, "#755c40", 'rx="3"') +
    `<path d="M546 486V314q103-140 204 0v172Z" fill="#100f0c"/>` +
    flame(648, 468, 1.2) +
    `<circle cx="650" cy="424" r="170" fill="url(#${uid}-glow)" opacity=".33"/>`;
  out += `<path d="m563 161-28-54m22 37-42-22m220 39 23-53m-16 36 42-23" stroke="#b6a585" stroke-width="5" fill="none" stroke-linecap="round"/>`;
  // Noticeboard and night window.
  out +=
    rect(786, 145, 108, 159, "#624c33", 'rx="4"') +
    rect(793, 152, 94, 144, "#745d40") +
    note(820, 194, -7) +
    note(861, 208, 5) +
    note(841, 263, -4);
  out +=
    rect(926, 135, 160, 185, "#191e18", 'rx="4"') +
    rect(936, 146, 140, 164, "#24423c") +
    '<circle cx="1031" cy="186" r="15" fill="#b2c0a6" opacity=".6"/>';
  for (const x of [950, 980, 1015, 1050, 1070])
    out += tree(x, 310, 0.16, "#18352d", true);
  out += rect(1003, 144, 6, 167, "#1b251f") + rect(934, 230, 144, 6, "#1b251f");
  // Stairs.
  for (let i = 0; i < 6; i++)
    out += `<path d="M1094 ${510 - i * 43}h88v30l-88 8Z" fill="${i % 2 ? "#4f3b27" : "#5c452e"}"/>`;
  out += `<path d="m1090 491 82-235" stroke="#251e17" stroke-width="10"/>`;
  out +=
    person(342, 431, 1.16, "#493b34", "#ad8053", "#c89b70") +
    rect(213, 430, 303, 148, "#523723", 'rx="4"') +
    rect(206, 425, 318, 16, "#8e6844", 'rx="3"');
  for (const x of [228, 282, 335, 390, 447, 500])
    out += rect(x, 449, 3, 116, "#38291c");
  out +=
    bottle(458, 424, "#536b4e", 0.8) +
    rect(260, 401, 19, 25, "#a7b3a1", 'rx="2"');
  out +=
    person(674, 544, 0.98, "#3c3e45", "#312a27", "#bd9472") +
    table(672, 574, 1) +
    note(715, 568, -9) +
    lantern(628, 553, uid, 0.35);
  out +=
    person(989, 521, 0.9, "#344f43", "#473a2a", "#c49b77", true) +
    table(991, 571, 0.86);
  out +=
    lantern(648, 88, uid, 0.85) +
    `<path d="M648 30v37" stroke="#141a15" stroke-width="3"/>`;
  return out;
}
function woodland(tile: Tile, uid: string, p: Palette) {
  let out = rect(0, 0, 1200, 700, p[0]);
  out += `<path d="M0 420Q250 260 520 365T1200 340V700H0Z" fill="${p[1]}"/>`;
  for (let i = 0; i < 16; i++)
    out += tree(
      20 + i * 82,
      390 + (i % 4) * 20,
      0.8 + (i % 5) * 0.16,
      i % 2 ? "#2c4238" : "#263d33",
      true,
    );
  out += `<path d="M120 700q460-180 420-290l110-10q-70 180 350 300" fill="#7c7959" opacity=".5"/>`;
  for (let i = 0; i < 5; i++)
    out += `<path d="m${190 + i * 220} 0-110 420 190-28L${340 + i * 220} 0" fill="#b8c28b" opacity=".025"/>`;
  out +=
    tree(126, 598, 2.4, "#243a2c") +
    tree(1081, 592, 2.2, "#1c3229", true) +
    tree(363, 500, 1.5, "#334b36", true) +
    rock(619, 539, 1.2, p[2]) +
    rock(834, 611, 0.7, p[2]);
  for (let i = 0; i < 16; i++) {
    const x = ((i * 163 + tile.id * 37) % 1100) + 50,
      y = 540 + ((i * 43) % 150);
    out += `<path d="m${x} ${y} 7-20 4 17 10-25" fill="none" stroke="${p[3]}" stroke-width="2" opacity=".35"/>`;
  }
  out +=
    `<path d="m354 340 19 4m-20 7 19 4m-19 7 18 4" stroke="#b8b99a" stroke-width="3"/><path d="m850 328 40 5-4 18-19-3-3 53-16-2Z" fill="#93978a" opacity=".7"/>` +
    rect(596, 501, 46, 24, "#72644b", 'rx="4"') +
    `<path d="M606 501v-10q13-12 25 0v10" fill="none" stroke="#a1916b" stroke-width="3"/>`;
  if (tile.id === 15)
    for (let i = 0; i < 25; i++)
      out += `<path d="m${200 + i * 35} ${580 + (i % 4) * 21} 12-7-5 10" fill="#b9b6a1" opacity=".4"/>`;
  if (tile.id === 6)
    out +=
      rect(210, 266, 10, 127, "#645c42") +
      `<path d="m220 267 65 14-65 27" fill="#7c7755"/>`;
  return out;
}
function moor(tile: Tile, uid: string, p: Palette) {
  let out =
    rect(0, 0, 1200, 700, p[0]) +
    `<circle cx="905" cy="138" r="46" fill="#c6c29a" opacity=".28"/><path d="M0 346 185 216l149 83 186-166 202 149 219-113 259 166V700H0Z" fill="${p[2]}" opacity=".5"/><path d="M0 448q200-136 430-55t770-37v344H0Z" fill="${p[1]}"/><path d="M0 700q420-302 610-267L844 700Z" fill="#8b8761" opacity=".22"/>`;
  for (let i = 0; i < 7; i++)
    out += rock(105 + i * 157, 414 + (i % 3) * 37, 0.8 + (i % 3) * 0.3, p[2]);
  if (tile.id === 10) {
    for (let i = 0; i < 7; i++) {
      const x = 260 + i * 107,
        y = 380 + Math.abs(3 - i) * 35;
      out += `<path d="m${x - 24} ${y + 95} 6-146 24-16 27 13 9 149Z" fill="${p[2]}" stroke="#9da68b" stroke-opacity=".25"/>`;
    }
  } else {
    out +=
      rect(306, 194, 11, 196, "#655c41") +
      `<path d="m280 213 118 11-2 34-118-12Z" fill="#807052"/><path d="m348 249-4 44 10-17 8 16 7-42" stroke="#b0a381" stroke-width="2" fill="none"/>`;
    out += rock(807, 401, 1.7, p[2]);
  }
  for (let i = 0; i < 38; i++) {
    const x = (i * 131 + tile.id * 41) % 1200,
      y = 492 + (i % 7) * 26;
    out += `<path d="m${x} ${y} 8-29m-8 22-9-14m9 9 14-12" stroke="${p[3]}" stroke-width="2" fill="none" opacity=".3"/>`;
  }
  out +=
    rock(590, 582, 0.7, p[2]) +
    `<path d="m568 560 20-3 23 6-13 11-26-5Z" fill="#b6b094"/>`;
  return out;
}
function water(tile: Tile, uid: string, p: Palette) {
  let out = woodland(tile, uid, p);
  out += `<path d="M680 330q-120 96 80 170T570 700h630V500q-270 91-380-37t-48-133" fill="#476864"/><path d="M766 352q-95 74 64 130t-5 93m-107 38q178-39 287-31M674 653h336" fill="none" stroke="#afc2ac" opacity=".25" stroke-width="3"/>`;
  out +=
    `<path d="m402 423 30-13 390 136-7 28Z" fill="#605540"/><path d="m441 423 344 121" stroke="#998463" stroke-width="3"/><path d="M347 246v151m0-118 40 11" stroke="#64573e" stroke-width="8"/>` +
    lantern(384, 293, uid, 0.45);
  for (let i = 0; i < 6; i++)
    out += rock(560 + i * 45, 524 + (i % 3) * 18, 0.35, "#7d8879");
  for (let i = 0; i < 15; i++) {
    const x = 880 + i * 21,
      y = 590 + (i % 3) * 24;
    out += `<path d="m${x} ${y} 0-65m0 35 11-18" stroke="#859475" stroke-width="3" fill="none"/>`;
  }
  if (tile.id === 11)
    out += `<path d="m656 500 25 4 30 12-22 9-44-12Z" fill="#263e38"/>`;
  return out;
}
function altar(tile: Tile, uid: string, p: Palette) {
  let out = woodland(tile, uid, p);
  out += `<ellipse cx="622" cy="526" rx="265" ry="97" fill="#334a3c"/><ellipse cx="622" cy="520" rx="220" ry="69" fill="#526556" stroke="#94a38a" stroke-opacity=".4" stroke-width="2"/>`;
  for (const [x, y, w, h] of [
    [345, 428, 85, 235],
    [866, 420, 79, 218],
    [608, 360, 92, 220],
  ])
    out += `<path d="m${x - w / 2} ${y} 9-${h - 22} ${w / 2 - 4}-22 ${w / 2 - 2} 16 9 ${h - 16}Z" fill="#5b6d5b" stroke="#a3ae91" stroke-opacity=".25"/><path d="m${x - 11} ${y - h + 65} 15-6-8 19 16 12-16 13" stroke="#a5b38b" stroke-width="3" fill="none"/>`;
  out +=
    `<ellipse cx="622" cy="508" rx="90" ry="29" fill="#253b32"/><ellipse cx="622" cy="499" rx="89" ry="29" fill="#7e8d6d" stroke="#b8c79d" stroke-opacity=".35"/><circle cx="622" cy="477" r="150" fill="url(#${uid}-cold)"/>` +
    star(622, 477, 1.3) +
    `<path d="M565 516v32m114-32v32m-110-30 107-1" stroke="#566b50" stroke-width="15"/>` +
    note(875, 461, 18);
  for (let i = 0; i < 13; i++)
    out += `<circle cx="${410 + i * 32}" cy="${375 + (i % 4) * 26}" r="${1 + (i % 3)}" fill="#c7c99a" opacity=".55"/>`;
  return out;
}
function stonework() {
  let out = "";
  for (let row = 0; row < 8; row++)
    for (let col = 0; col < 14; col++)
      out += rect(
        col * 100 + (row % 2 ? -50 : 0),
        row * 64 + 20,
        98,
        61,
        "none",
        'stroke="#7f826b" stroke-opacity=".075" rx="3"',
      );
  return out;
}
function crypt(tile: Tile, uid: string, p: Palette) {
  let out = rect(0, 0, 1200, 700, "#1c2625") + stonework();
  out += `<path d="M0 700 396 387h408l396 313Z" fill="#343b32"/>`;
  for (let i = 0; i < 7; i++)
    out += `<path d="M${180 + i * 125} 700 600 350" stroke="#8c8a67" opacity=".15"/>`;
  for (const y of [457, 550, 655])
    out += `<path d="M0 ${y}h1200" stroke="#97916d" opacity=".13"/>`;
  out +=
    arch(435, 49, 330, 392, "#0e1819", "#4d574b") +
    arch(470, 92, 260, 340, "#111d1d", "#3e4c41");
  for (const x of [130, 975]) {
    out +=
      rect(x, 120, 95, 360, "#444f42") +
      rect(x - 12, 106, 119, 25, "#68705a") +
      rect(x - 16, 470, 127, 30, "#525e4c");
    out +=
      `<path d="m${x + 20} 423 8-161 22-20 23 22 4 159Z" fill="#65705b"/><circle cx="${x + 47}" cy="220" r="26" fill="#6b765e"/><path d="m${x + 16} 319 28 32 30-32" fill="none" stroke="#889378" stroke-width="12"/>` +
      star(x + 47, 326, 0.45, "#a0ad88");
  }
  out +=
    `<path d="m422 528 172-49 201 43-173 66Z" fill="#6a755e" stroke="#949d7b" stroke-width="2"/><path d="m422 528v48l201 65 172-60v-59l-173 66Z" fill="#465641"/><path d="m468 514 144-18 137 25-130 42Z" fill="#7e8667"/>` +
    star(616, 531, 0.6) +
    lantern(322, 291, uid, 0.8) +
    lantern(882, 291, uid, 0.8);
  out +=
    `<path d="m286 281 20-9 5 13m574-1 26-13 4 15" fill="none" stroke="#69755a" stroke-width="4"/>` +
    rock(290, 595, 0.6, "#52604c") +
    rock(954, 626, 0.8, "#4e5847");
  if (tile.id !== 12) out += `<path d="m560 376 16-70 18 70Z" fill="#293c35"/>`;
  return out;
}
function tower(tile: Tile, uid: string, p: Palette) {
  let out =
    rect(0, 0, 1200, 700, "#242b2b") +
    stonework() +
    `<path d="M0 700 190 475h820l190 225Z" fill="#30382f"/>`;
  out +=
    arch(505, 42, 192, 329, "#25434a", "#687163") +
    `<circle cx="602" cy="130" r="34" fill="#c1cbb2" opacity=".5"/>` +
    rect(597, 46, 8, 310, "#4c5b50") +
    rect(518, 231, 171, 8, "#4c5b50");
  for (const x of [100, 890]) {
    out += rect(
      x,
      108,
      213,
      359,
      "#232a22",
      'stroke="#586449" stroke-width="12"',
    );
    for (let row = 0; row < 4; row++) {
      out += rect(x, 180 + row * 82, 214, 9, "#645d3f");
      for (let i = 0; i < 10; i++)
        out += rect(
          x + 7 + i * 20,
          143 + row * 82 + (i % 3) * 7,
          14,
          37 - (i % 3) * 7,
          ["#66705c", "#837853", "#5a6b67", "#7d5f4c"][i % 4],
        );
    }
  }
  out +=
    table(334, 510, 1.4) +
    person(346, 459, 1.1, "#4c5360", "#b5b2a0", "#b8a083", true) +
    note(300, 498, -12) +
    note(387, 514, 5) +
    bottle(428, 496, "#394f50", 0.7);
  out +=
    `<ellipse cx="625" cy="539" rx="105" ry="28" fill="#53614c"/>` +
    rect(612, 376, 25, 154, "#70694c") +
    `<circle cx="624" cy="321" r="145" fill="url(#${uid}-cold)"/><g fill="none" stroke="#b29e67" stroke-width="3"><ellipse cx="624" cy="319" rx="108" ry="40" transform="rotate(-31 624 319)"/><ellipse cx="624" cy="319" rx="108" ry="40" transform="rotate(36 624 319)"/><ellipse cx="624" cy="319" rx="45" ry="102"/><circle cx="624" cy="319" r="89"/></g>` +
    star(624, 319, 1.2, "#d1bf87");
  out += `<path d="M784 602q121-180 371-124" fill="none" stroke="#666d57" stroke-width="25"/>`;
  for (let i = 0; i < 6; i++)
    out += `<path d="m${798 + i * 47} ${581 - i * 20} 80 24" stroke="#979677" stroke-width="6"/>`;
  out += note(902, 409, -9);
  return out;
}
function abbey(tile: Tile, uid: string, p: Palette) {
  let out =
    rect(0, 0, 1200, 700, "#303a32") +
    stonework() +
    `<path d="M0 700 290 442h620l290 258Z" fill="#505745"/>`;
  for (const x of [140, 470, 800]) {
    out += arch(x, 30, 218, 366, "#1e3b36", "#6e7762");
    out +=
      `<g opacity=".65">${rect(x + 18, 137, 56, 183, "#6b8d78")}${rect(x + 80, 74, 56, 249, "#b4a36c")}${rect(x + 142, 138, 56, 182, "#668b96")}</g>` +
      star(x + 110, 181, 2, "#bfc5a5") +
      rect(x + 104, 46, 9, 340, "#384b3f");
    out +=
      rect(x - 23, 8, 22, 479, "#535f4c") +
      rect(x + 219, 8, 22, 479, "#535f4c");
  }
  for (const x of [160, 400, 640, 880])
    out += `<path d="m${x} 511 110-13 98 40-110 17Z" fill="#6f6347"/><path d="m${x} 522v31m205-17v30" stroke="#4b4935" stroke-width="13"/>`;
  out +=
    table(348, 500, 1.4) +
    person(344, 445, 1.04, "#747765", "#a7a997", "#b7a080", true) +
    note(330, 479, -7) +
    note(402, 507, 2) +
    lantern(286, 482, uid, 0.4) +
    note(639, 565, -14);
  out += `<path d="M515 120 353 589l219 51 99-514M854 136 759 604l184 13 70-459" fill="#c9d0a0" opacity=".065"/>`;
  return out;
}
function gate(tile: Tile, uid: string, p: Palette) {
  let out = moor(tile, uid, p);
  out +=
    rect(75, 87, 1050, 413, "#454f43") +
    stonework() +
    arch(441, 90, 310, 418, "#182d2a", "#737961");
  for (const x of [87, 912]) {
    out +=
      rect(x, 55, 204, 451, "#3d493c") + rect(x - 12, 43, 228, 32, "#68715a");
    for (let j = 0; j < 5; j++) out += rect(x + j * 44, 16, 30, 42, "#68715a");
    for (let j = 0; j < 3; j++)
      out += rect(x + 84, 122 + j * 108, 22, 64, "#202f28");
  }
  out +=
    `<path d="M588 111v250m-91-210h196" stroke="#4d5942" stroke-width="8"/>` +
    rect(757, 102, 9, 272, "#766d4d") +
    `<path d="m766 111 90 15-7 163-83-23Z" fill="#7d7a50"/><path d="m786 189 17-14 11 8 19-23" stroke="#c8be87" stroke-width="4" fill="none"/>` +
    person(350, 529, 1.2, "#526450", "#5d5140", "#be9771") +
    `<path d="M392 529V321l-8-20-8 20v208Z" fill="#aa9f76"/>` +
    rect(881, 442, 125, 77, "#5e4e32") +
    note(919, 451, 5) +
    lantern(271, 265, uid, 0.65);
  return out;
}
function camp(tile: Tile, uid: string, p: Palette, den = false) {
  let out = woodland(tile, uid, p);
  out += `<path d="m175 505 100-234 139 239Z" fill="${den ? "#4b5641" : "#7f7855"}"/><path d="m275 271 11 234h128Z" fill="${den ? "#394a35" : "#5b6245"}"/><path d="m233 506 41-126 47 126Z" fill="#263528"/><path d="m763 476 71-165 131 168Z" fill="#5c6649"/><path d="m834 311 19 167h112Z" fill="#4b5b3e"/>`;
  out +=
    person(347, 535, 1.06, "#50613f", "#564a37", "#b99170") +
    flame(613, 551, 0.62) +
    lantern(292, 416, uid, 0.42) +
    rect(812, 383, 8, 135, "#6a634a") +
    `<path d="m789 388 118 10-5 64-118-9Z" fill="#958762"/>` +
    note(840, 426, -2) +
    rock(599, 610, 0.7, "#677056");
  if (den)
    out +=
      `<path d="M694 477v-136q80-159 160 0v136" fill="#182d25" stroke="#4b5c42" stroke-width="29"/>` +
      `<path d="m888 517 27-3 13 5m-54 22 21-4" stroke="#c0baa0" stroke-width="6"/>`;
  return out;
}
function pass(tile: Tile, uid: string, p: Palette) {
  let out = moor(tile, uid, p);
  out += `<path d="M0 0h340l82 192-35 107 111 401H0ZM1200 0H936L830 237l76 148-81 315h375Z" fill="#3a4c49"/><path d="m30 100 208 51-71 118 163 102-7 196m695-465 109 98-69 164 70 175" stroke="#718176" opacity=".35" stroke-width="4" fill="none"/>`;
  out += `<path d="m337 405 134 48 282-12 160-53" fill="none" stroke="#a19775" stroke-width="6"/><path d="m337 461 134 48 282-12 160-53" fill="none" stroke="#7f7b5e" stroke-width="6"/>`;
  for (let i = 0; i < 16; i++)
    out += `<path d="m${369 + i * 30} ${468 + Math.sin(i / 4) * 25}v-47" stroke="#8d8460" stroke-width="3"/>`;
  out +=
    rect(314, 468, 10, 130, "#766c4e") +
    `<path d="m286 485 93 11-3 34-93-12Z" fill="#8d7a54"/>` +
    rock(303, 612, 1.1, p[2]) +
    rock(962, 540, 1.1, p[2]);
  return out;
}
export function draw(
  tile: Tile,
  place: Place,
  {
    uid = "stage",
    time = 0,
    preview = false,
  }: { uid?: string; time?: number; preview?: boolean } = {},
) {
  const p = palette[tile.biome] || palette.plain;
  const funcs: Record<
    Exclude<SceneKind, "tavern">,
    (tile: Tile, uid: string, p: Palette) => string
  > = {
    woodland,
    moor,
    water,
    altar,
    crypt,
    tower,
    abbey,
    gate,
    camp,
    den: (t, u, c) => camp(t, u, c, true),
    pass,
  };
  let body =
    place.kind === "tavern"
      ? tavern(uid)
      : (funcs[place.kind as Exclude<SceneKind, "tavern">] || moor)(
          tile,
          uid,
          p,
        );
  const indoor = ["tavern", "crypt", "tower", "abbey"].includes(place.kind);
  const hour = (6 + time * 2) % 24;
  const night = !indoor && (hour >= 18 || hour < 6);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 700" fill="none" role="img" aria-label="${place.title.replace(/[&<>"']/g, "")}的场景插画"><defs><radialGradient id="${uid}-glow"><stop stop-color="#efbd68" stop-opacity=".33"/><stop offset="1" stop-color="#efbd68" stop-opacity="0"/></radialGradient><radialGradient id="${uid}-cold"><stop stop-color="#bed2ad" stop-opacity=".25"/><stop offset="1" stop-color="#bed2ad" stop-opacity="0"/></radialGradient><radialGradient id="${uid}-shade"><stop offset=".25" stop-color="#06120e" stop-opacity="0"/><stop offset="1" stop-color="#06120e" stop-opacity=".53"/></radialGradient><linearGradient id="${uid}-fog" x2="0" y2="1"><stop stop-color="#a6b9a2" stop-opacity="0"/><stop offset=".5" stop-color="#a6b9a2" stop-opacity=".035"/><stop offset="1" stop-color="#091c17" stop-opacity=".18"/></linearGradient></defs>${body}${!indoor ? rect(0, 180, 1200, 520, `url(#${uid}-fog)`) : ""}${night ? rect(0, 0, 1200, 700, "#0b233b", 'opacity=".24"') : ""}${rect(0, 0, 1200, 700, `url(#${uid}-shade)`)}${!preview ? '<path d="M30 50V30h30m1080 0h30v20M30 650v20h30m1080 0h30v-20" stroke="#c7bd91" stroke-opacity=".2"/>' : ""}</svg>`;
}
