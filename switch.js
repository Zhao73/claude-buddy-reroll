#!/usr/bin/env node

/**
 * Claude Code Buddy Switch — Interactive pet switcher
 *
 * Usage:
 *   node switch.js              # Show all pets, pick one
 *   node switch.js dragon       # Switch directly to dragon
 *   node switch.js --restore    # Restore original config
 *   node switch.js --status     # Show current pet info
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// ── Constants ──────────────────────────────────────────────────────────────

const CONFIG_PATH = path.join(process.env.HOME, ".claude.json");
const BACKUP_PATH = CONFIG_PATH + ".buddy-backup";
const SALT = "friend-2026-401";

const RARITIES = ["common", "uncommon", "rare", "epic", "legendary"];
const RARITY_WEIGHTS = { common: 60, uncommon: 25, rare: 10, epic: 4, legendary: 1 };
const SPECIES = [
  "duck", "goose", "blob", "cat", "dragon", "octopus",
  "owl", "penguin", "turtle", "snail", "ghost", "axolotl",
  "capybara", "cactus", "robot", "rabbit", "mushroom", "chonk",
];
const SPECIES_CN = {
  duck: "鸭子", goose: "鹅", blob: "果冻", cat: "猫",
  dragon: "龙", octopus: "章鱼", owl: "猫头鹰", penguin: "企鹅",
  turtle: "乌龟", snail: "蜗牛", ghost: "幽灵", axolotl: "六角恐龙",
  capybara: "卡皮巴拉", cactus: "仙人掌", robot: "机器人", rabbit: "兔子",
  mushroom: "蘑菇", chonk: "胖墩",
};
const EYES = ["·", "✦", "×", "◉", "@", "°"];
const HATS = ["none", "crown", "tophat", "propeller", "halo", "wizard", "beanie", "tinyduck"];
const STATS = ["DEBUGGING", "PATIENCE", "CHAOS", "WISDOM", "SNARK"];
const STAT_BASE = { common: 5, uncommon: 15, rare: 25, epic: 35, legendary: 50 };
const RARITY_STARS = { common: "★", uncommon: "★★", rare: "★★★", epic: "★★★★", legendary: "★★★★★" };

const SPECIES_ART = {
  duck:     ['            ','    __      ','  <({E} )___  ','   (  ._>   ','    `--´    '],
  goose:    ['            ','     ({E}>    ','     ||     ','   _(__)_   ','    ^^^^    '],
  blob:     ['            ','   .----.   ','  ( {E}  {E} )  ','  (      )  ','   `----´   '],
  cat:      ['            ','   /\\_/\\    ','  ( {E}   {E})  ','  (  ω  )   ','  (")_(")   '],
  dragon:   ['            ','  /^\\  /^\\  ',' <  {E}  {E}  > ',' (   ~~   ) ','  `-vvvv-´  '],
  octopus:  ['            ','   .----.   ','  ( {E}  {E} )  ','  (______)  ','  /\\/\\/\\/\\  '],
  owl:      ['            ','   /\\  /\\   ','  (({E})({E}))  ','  (  ><  )  ','   `----´   '],
  penguin:  ['            ','  .---.     ','  ({E}>{E})     ',' /(   )\\    ','  `---´     '],
  turtle:   ['            ','   _,--._   ','  ( {E}  {E} )  ',' /[______]\\ ','  ``    ``  '],
  snail:    ['            ',' {E}    .--.  ','  \\  ( @ )  ','   \\_`--´   ','  ~~~~~~~   '],
  ghost:    ['            ','   .----.   ','  / {E}  {E} \\  ','  |      |  ','  ~`~``~`~  '],
  axolotl:  ['            ','}~(______)~{','}~({E} .. {E})~{','  ( .--. )  ','  (_/  \\_)  '],
  capybara: ['            ','  n______n  ',' ( {E}    {E} ) ',' (   oo   ) ','  `------´  '],
  cactus:   ['            ',' n  ____  n ',' | |{E}  {E}| | ',' |_|    |_| ','   |    |   '],
  robot:    ['            ','   .[||].   ','  [ {E}  {E} ]  ','  [ ==== ]  ','  `------´  '],
  rabbit:   ['            ','   (\\__/)   ','  ( {E}  {E} )  ',' =(  ..  )= ','  (")__(")  '],
  mushroom: ['            ',' .-o-OO-o-. ','(__________)','   |{E}  {E}|   ','   |____|   '],
  chonk:    ['            ','  /\\    /\\  ',' ( {E}    {E} ) ',' (   ..   ) ','  `------´  '],
};

const HATS_ART = {
  none: '', crown: '   \\^^^/    ', tophat: '   [___]    ',
  propeller: '    -+-     ', halo: '   (   )    ', wizard: '    /^\\     ',
  beanie: '   (___)    ', tinyduck: '    ,>      ',
};

// Pre-rolled Legendary Shiny IDs (verified)
const PREROLLED = {
  duck:     'fbb064c6d0dc67b01121b757aab224f8a1c3876e85698663c8dd7d02117c3c0d',
  goose:    'e4b9555f102f85c16a6774ed2a7d6798c16fdcd03c14c0af79cb53e9620c08b4',
  blob:     '469b08168a7c158cafce4688ee78fc192a2603e626a5646250069a5650b2b6a9',
  cat:      'd1330a144e69962f6b631868a5e2a87de51582969412fa6e21556ed0fce560b6',
  dragon:   'c9130b2ade6f668395281901c2cbe78c27d03d6cf1c552309b6ef34b11313742',
  octopus:  '7008e44266d5ba07b12a302728729febe7265ee640b069f4288158dc44b26e63',
  owl:      'e9f590be928a17e32664baa252e08edce6812dc86ed96abe3c06ae496c5d1950',
  penguin:  '1c9aef4f3ef2ff9d561fdb467f120aee7ac244ff464347479b2d2b354e35dfb5',
  turtle:   'f287702f0e017d1f65599231d4c6a9ce53274d34e6090f0081d0194fd87df49c',
  snail:    'a75398e61456425c7eeecd5fef2b567338d289a300669e5570db32b9cf4bafb3',
  ghost:    'b4cf03d9615a11b13560c625d7c1f4e26a5960e7674c18c7084582d1542755f3',
  axolotl:  '9afda6fae3735ad19bed7e55c826d3c4c16ab5b13fa4d869e8bce9de0c6df45c',
  capybara: '874d02aae1974e98baba8dbe60801ef48852f699764d418577785f8eb5ffbab8',
  cactus:   '7fee8b175fdc2695508617ac3bbee7df00336e2bc6b1ad922b82dae22137b33e',
  robot:    '259bd301a471b1ed2ea94d025e4bb601be653bb0563e7f49328287f13ff870a6',
  rabbit:   'cd32890107a4ae3bc74225437c8ab6aefbcc048a1e39fe34c3324c0667dcd50d',
  mushroom: '901260021b10e33eab00b816579714d0e645f2543d71b4737339ca98cd7f88e2',
  chonk:    '1834011daac05773368eb3ff1d28cd3bf939043be89533e8678cd53ec632096a',
};

// ── Algorithm ──────────────────────────────────────────────────────────────

function fnv1a(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

function mulberry32(seed) {
  let k = seed >>> 0;
  return function () {
    k |= 0; k = (k + 1831565813) | 0;
    let t = Math.imul(k ^ (k >>> 15), 1 | k);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }

function getRarity(rng) {
  let r = rng() * 100;
  for (const rar of RARITIES) { r -= RARITY_WEIGHTS[rar]; if (r < 0) return rar; }
  return "common";
}

function getStats(rng, rarity) {
  const base = STAT_BASE[rarity];
  const peakStat = pick(rng, STATS);
  let valleyStat = pick(rng, STATS);
  while (valleyStat === peakStat) valleyStat = pick(rng, STATS);
  const result = {};
  for (const stat of STATS) {
    if (stat === peakStat) result[stat] = Math.min(100, base + 50 + Math.floor(rng() * 30));
    else if (stat === valleyStat) result[stat] = Math.max(1, base - 10 + Math.floor(rng() * 15));
    else result[stat] = base + Math.floor(rng() * 40);
  }
  return result;
}

function generate(userId) {
  const key = userId + SALT;
  const rng = mulberry32(fnv1a(key));
  const rarity = getRarity(rng);
  const species = pick(rng, SPECIES);
  const eye = pick(rng, EYES);
  const hat = rarity === "common" ? "none" : pick(rng, HATS);
  const shiny = rng() < 0.01;
  const stats = getStats(rng, rarity);
  return { rarity, species, eye, hat, shiny, stats };
}

function renderArt(species, eye, hat) {
  let lines = SPECIES_ART[species].map(l => l.replaceAll("{E}", eye));
  if (hat !== "none" && !lines[0].trim()) lines[0] = HATS_ART[hat] || lines[0];
  if (!lines[0].trim()) lines.shift();
  return lines;
}

function renderPet(sp) {
  const id = PREROLLED[sp];
  const r = generate(id);
  const art = renderArt(r.species, r.eye, r.hat);
  const peakName = Object.entries(r.stats).reduce((a, b) => b[1] > a[1] ? b : a)[0];

  const lines = [];
  lines.push(`  ${sp} — ${SPECIES_CN[sp]}  ${RARITY_STARS[r.rarity]} ${r.shiny ? "✨ SHINY" : ""}`);
  lines.push("");
  for (const l of art) lines.push("    " + l);
  lines.push("");
  for (const [k, v] of Object.entries(r.stats)) {
    const bar = "█".repeat(Math.round(v / 10)) + "░".repeat(10 - Math.round(v / 10));
    const marker = k === peakName ? " ←" : "";
    lines.push(`    ${k.padEnd(10)} ${bar} ${String(v).padStart(3)}${marker}`);
  }
  return lines.join("\n");
}

// ── Actions ────────────────────────────────────────────────────────────────

function applyPet(species) {
  if (!fs.existsSync(CONFIG_PATH)) {
    console.error("Error: ~/.claude.json not found");
    process.exit(1);
  }

  if (!fs.existsSync(BACKUP_PATH)) {
    fs.copyFileSync(CONFIG_PATH, BACKUP_PATH);
    console.log("  Backup created: ~/.claude.json.buddy-backup");
  }

  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));

  if (config.oauthAccount?.accountUuid) {
    delete config.oauthAccount.accountUuid;
    console.log("  Removed accountUuid");
  }

  config.userID = PREROLLED[species];
  delete config.companion;

  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));

  const r = generate(PREROLLED[species]);
  console.log(`\n  Switched to: ${RARITY_STARS[r.rarity]} ${r.shiny ? "✨ SHINY " : ""}${species} (${SPECIES_CN[species]})`);
  console.log("");
  for (const l of renderArt(r.species, r.eye, r.hat)) console.log("    " + l);
  console.log("\n  Restart Claude Code and type /buddy to hatch!\n");
  console.log("  IMPORTANT: Launch with OAuth token:");
  console.log("    export CLAUDE_CODE_OAUTH_TOKEN=\"your-token\"");
  console.log("    claude\n");
}

function showStatus() {
  if (!fs.existsSync(CONFIG_PATH)) {
    console.log("  ~/.claude.json not found");
    return;
  }
  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
  const hasUuid = !!config.oauthAccount?.accountUuid;
  const userId = config.userID || "(none)";
  const companion = config.companion;

  console.log("\n  Current config:");
  console.log(`    accountUuid: ${hasUuid ? "present (buddy locked to account)" : "removed (buddy uses userID)"}`);
  console.log(`    userID: ${userId.substring(0, 20)}...`);

  if (companion) {
    console.log(`    companion: ${companion.name}`);
    const r = generate(userId);
    console.log(`    species: ${r.species} (${SPECIES_CN[r.species]})`);
    console.log(`    rarity: ${RARITY_STARS[r.rarity]} ${r.rarity} ${r.shiny ? "✨ SHINY" : ""}`);
  } else {
    console.log("    companion: (not hatched)");
  }
  console.log("");
}

function restore() {
  if (!fs.existsSync(BACKUP_PATH)) {
    console.error("  No backup found at ~/.claude.json.buddy-backup");
    process.exit(1);
  }
  fs.copyFileSync(BACKUP_PATH, CONFIG_PATH);
  console.log("  Restored from backup. Your original buddy is back.");
}

function showAll() {
  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log("║     Claude Code Buddy — Legendary Shiny Gallery     ║");
  console.log("╚══════════════════════════════════════════════════════╝\n");

  let i = 1;
  for (const sp of SPECIES) {
    console.log(`  [${String(i).padStart(2)}] ${renderPet(sp)}`);
    console.log("");
    i++;
  }

  console.log("━".repeat(56));
  console.log("\n  Usage: node switch.js <species>");
  console.log("  Example: node switch.js dragon\n");
}

// ── CLI ────────────────────────────────────────────────────────────────────

const arg = process.argv[2];

if (!arg) {
  showAll();
} else if (arg === "--restore") {
  restore();
} else if (arg === "--status") {
  showStatus();
} else if (PREROLLED[arg]) {
  applyPet(arg);
} else {
  // Try fuzzy match
  const match = SPECIES.find(s => s.startsWith(arg.toLowerCase()));
  if (match) {
    applyPet(match);
  } else {
    console.error(`  Unknown species: "${arg}"`);
    console.error(`  Available: ${SPECIES.join(", ")}`);
    process.exit(1);
  }
}
