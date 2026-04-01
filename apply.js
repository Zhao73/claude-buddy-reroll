#!/usr/bin/env node

/**
 * Apply a pre-rolled userID to ~/.claude.json
 *
 * Usage:
 *   node apply.js <userID>
 *   node apply.js --restore     # restore from backup
 */

const fs = require("fs");
const path = require("path");

const configPath = path.join(process.env.HOME, ".claude.json");
const backupPath = configPath + ".backup";

const arg = process.argv[2];

if (!arg) {
  console.error("Usage:");
  console.error("  node apply.js <userID>      Apply a new buddy userID");
  console.error("  node apply.js --restore     Restore from backup");
  process.exit(1);
}

// ── Restore ────────────────────────────────────────────────────────────────

if (arg === "--restore") {
  if (!fs.existsSync(backupPath)) {
    console.error("No backup found at " + backupPath);
    process.exit(1);
  }
  fs.copyFileSync(backupPath, configPath);
  console.log("Restored from backup.");
  process.exit(0);
}

// ── Apply ──────────────────────────────────────────────────────────────────

const userID = arg;

if (!fs.existsSync(configPath)) {
  console.error("Config not found: " + configPath);
  process.exit(1);
}

// Backup
if (!fs.existsSync(backupPath)) {
  fs.copyFileSync(configPath, backupPath);
  console.log("Backup created: " + backupPath);
}

const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

// Remove accountUuid
if (config.oauthAccount && config.oauthAccount.accountUuid) {
  delete config.oauthAccount.accountUuid;
  console.log("Removed accountUuid");
}

// Set userID
config.userID = userID;
console.log("Set userID: " + userID);

// Clear companion to trigger re-hatch
if (config.companion) {
  console.log("Cleared companion: " + config.companion.name);
  delete config.companion;
}

fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

console.log("\nDone! Now restart Claude Code with:");
console.log("  export CLAUDE_CODE_OAUTH_TOKEN=\"your-token-here\"");
console.log("  claude");
console.log("\nThen type /buddy to hatch your new pet.");
