#!/usr/bin/env node

/**
 * Claude Code Buddy Finder
 * Brute-force search for a specific pet combination.
 *
 * Usage:
 *   node finder.js <species|any> [rarity] [shiny: true|false]
 *
 * Examples:
 *   node finder.js capybara legendary true    # Legendary Shiny Capybara
 *   node finder.js dragon epic false          # Epic Dragon (any shiny)
 *   node finder.js any legendary true         # Any Legendary Shiny species
 */

const crypto = require("crypto");

// ── Constants (extracted from Claude Code source) ──────────────────────────

const SALT = "friend-2026-401";

const RARITIES = ["common", "uncommon", "rare", "epic", "legendary"];

const RARITY_WEIGHTS = {
  common: 60,
  uncommon: 25,
  rare: 10,
  epic: 4,
  legendary: 1,
};

const SPECIES = [
  "duck",    "goose",    "blob",   "cat",
  "dragon",  "octopus",  "owl",    "penguin",
  "turtle",  "snail",    "ghost",  "axolotl",
  "capybara","cactus",   "robot",  "rabbit",
  "mushroom","chonk",
];

const SPECIES_CN = {
  duck: "鸭子", goose: "鹅", blob: "果冻", cat: "猫",
  dragon: "龙", octopus: "章鱼", owl: "猫头鹰", penguin: "企鹅",
  turtle: "乌龟", snail: "蜗牛", ghost: "幽灵", axolotl: "六角恐龙",
  capybara: "卡皮巴拉", cactus: "仙人掌", robot: "机器人", rabbit: "兔子",
  mushroom: "蘑菇", chonk: "胖墩",
};

const EYES = ["·", "✦", "×", "◉", "@", "°"];

const HATS = [
  "none", "crown", "tophat", "propeller",
  "halo", "wizard", "beanie", "tinyduck",
];

const STATS = ["DEBUGGING", "PATIENCE", "CHAOS", "WISDOM", "SNARK"];

const STAT_BASE = { common: 5, uncommon: 15, rare: 25, epic: 35, legendary: 50 };

const RARITY_STARS = {
  common: "★",
  uncommon: "★★",
  rare: "★★★",
  epic: "★★★★",
  legendary: "★★★★★",
};

// ── Algorithm ──────────────────────────────────────────────────────────────

function fnv1a(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed) {
  let k = seed >>> 0;
  return function () {
    k |= 0;
    k = (k + 1831565813) | 0;
    let t = Math.imul(k ^ (k >>> 15), 1 | k);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick(rng, arr) {
  return arr[Math.floor(rng() * arr.length)];
}

function getRarity(rng) {
  const total = Object.values(RARITY_WEIGHTS).reduce((a, b) => a + b, 0);
  let r = rng() * total;
  for (const rar of RARITIES) {
    r -= RARITY_WEIGHTS[rar];
    if (r < 0) return rar;
  }
  return "common";
}

function getStats(rng, rarity) {
  const base = STAT_BASE[rarity];
  const result = {};
  const peakIdx = Math.floor(rng() * 5);
  let valleyIdx = Math.floor(rng() * 5);
  while (valleyIdx === peakIdx) valleyIdx = Math.floor(rng() * 5);

  for (let i = 0; i < 5; i++) {
    if (i === peakIdx) {
      result[STATS[i]] = Math.min(100, base + 20 + Math.floor(rng() * 30));
    } else if (i === valleyIdx) {
      result[STATS[i]] = Math.max(1, base - 10 + Math.floor(rng() * 15));
    } else {
      result[STATS[i]] = base + Math.floor(rng() * 40);
    }
  }
  return result;
}

function generate(userId) {
  const key = userId + SALT;
  const hash = fnv1a(key);
  const rng = mulberry32(hash);

  const rarity = getRarity(rng);
  const species = pick(rng, SPECIES);
  const eye = pick(rng, EYES);
  const hat = rarity === "common" ? "none" : pick(rng, HATS);
  const shiny = rng() < 0.01;
  const stats = getStats(rng, rarity);

  return { rarity, species, eye, hat, shiny, stats };
}

// ── CLI ────────────────────────────────────────────────────────────────────

const targetSpecies = process.argv[2] || "any";
const targetRarity = process.argv[3] || "legendary";
const requireShiny = process.argv[4] !== "false";
const maxResults = parseInt(process.argv[5]) || 3;

if (targetSpecies !== "any" && !SPECIES.includes(targetSpecies)) {
  console.error(`Unknown species: "${targetSpecies}"`);
  console.error(`Available: ${SPECIES.join(", ")}`);
  process.exit(1);
}

if (!RARITIES.includes(targetRarity)) {
  console.error(`Unknown rarity: "${targetRarity}"`);
  console.error(`Available: ${RARITIES.join(", ")}`);
  process.exit(1);
}

console.log("╔══════════════════════════════════════════════════╗");
console.log("║       Claude Code Buddy Finder                  ║");
console.log("╚══════════════════════════════════════════════════╝");
console.log();
console.log(`  Target: ${targetRarity}${requireShiny ? " shiny" : ""} ${targetSpecies}`);
console.log(`  Finding ${maxResults} result(s)...\n`);

const startTime = Date.now();
let checked = 0;
const found = [];

while (found.length < maxResults) {
  const id = crypto.randomBytes(32).toString("hex");
  const result = generate(id);
  checked++;

  const speciesMatch = targetSpecies === "any" || result.species === targetSpecies;
  const rarityMatch = result.rarity === targetRarity;
  const shinyMatch = !requireShiny || result.shiny;

  if (speciesMatch && rarityMatch && shinyMatch) {
    found.push({ id, ...result });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    const cn = SPECIES_CN[result.species];

    console.log(`  ┌─ Result #${found.length} ─────────────────────────────`);
    console.log(`  │ Species: ${result.species} (${cn})`);
    console.log(`  │ Rarity:  ${RARITY_STARS[result.rarity]} ${result.rarity}`);
    console.log(`  │ Shiny:   ${result.shiny ? "✨ YES" : "no"}`);
    console.log(`  │ Eye:     ${result.eye}    Hat: ${result.hat}`);
    console.log(`  │`);
    for (const stat of STATS) {
      const val = result.stats[stat];
      const bar = "█".repeat(Math.round(val / 5)) + "░".repeat(20 - Math.round(val / 5));
      console.log(`  │ ${stat.padEnd(10)} ${bar} ${val}`);
    }
    console.log(`  │`);
    console.log(`  │ UserID: ${id}`);
    console.log(`  └─ (${checked.toLocaleString()} checked, ${elapsed}s)`);
    console.log();
  }

  if (checked % 200000 === 0) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    process.stdout.write(`\r  Searching... ${checked.toLocaleString()} checked (${elapsed}s)  `);
  }
}

const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
console.log(`Done! Found ${found.length} match(es) in ${checked.toLocaleString()} attempts (${elapsed}s)`);
console.log();
console.log("To apply, run:");
console.log(`  node apply.js ${found[0].id}`);
