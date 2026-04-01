# Claude Code Buddy Reroll Guide

> **Re-roll your `/buddy` pet to get any species, rarity, and even the 1% Shiny variant.**

<p align="center">
  <img src="https://img.shields.io/badge/Legendary-gold?style=for-the-badge" alt="Legendary"/>
  <img src="https://img.shields.io/badge/Shiny_1%25-blueviolet?style=for-the-badge" alt="Shiny 1%"/>
  <img src="https://img.shields.io/badge/18_Species-teal?style=for-the-badge" alt="18 Species"/>
</p>

**🌐 Language: English | [Chinese](README.zh.md) | [Japanese](README.ja.md)**

## Quick Start

```bash
git clone https://github.com/Zhao73/claude-buddy-reroll.git
cd claude-buddy-reroll

# Browse all 18 legendary shiny pets
node switch.js

# Switch to your favorite
node switch.js dragon

# Check current status
node switch.js --status

# Restore the original buddy
node switch.js --restore
```

## Default English Docs

This repository now defaults to English on GitHub.

- [Full English guide](README.en.md)
- [Quick prompt for Claude Code](PROMPT.md)
- [Chinese guide](README.zh.md)
- [Japanese guide](README.ja.md)

## What This Repo Includes

- `switch.js`: interactive gallery plus direct switching, status, and restore commands
- `finder.js`: brute-force finder for a specific species, rarity, and shiny combination
- `apply.js`: apply a known `userID` directly to `~/.claude.json`

## How It Works

Claude Code's `/buddy` system uses deterministic generation seeded from your identity:

```text
seed = FNV1a(userId + "friend-2026-401")
```

When Claude Code is launched with `CLAUDE_CODE_OAUTH_TOKEN`, it does not persist `accountUuid` into `~/.claude.json`. In that mode, `/buddy` falls back to `userID`, which this repo rewrites.

## Disclaimer

This only changes the cosmetic output of the `/buddy` easter egg. It does not affect billing, account security, OAuth tokens, or subscription state.

## License

MIT
