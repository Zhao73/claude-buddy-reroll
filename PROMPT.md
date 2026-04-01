# Quick Prompt — Paste This Into Claude Code

Copy and paste the prompt below into Claude Code. It will handle the rest automatically.

---

```text
Please switch my Claude Code /buddy pet.

Steps:
1. Clone this repository if it is not already available: git clone https://github.com/Zhao73/claude-buddy-reroll.git /tmp/buddy-reroll
2. Run node /tmp/buddy-reroll/switch.js to show all 18 legendary shiny pets with their appearance and stats
3. Show me every pet, then ask which one I want
4. After I choose, run node /tmp/buddy-reroll/switch.js <chosen-species> to switch to it
5. Tell me how to restart Claude Code with CLAUDE_CODE_OAUTH_TOKEN

If I do not have an OAuth token yet, ask me to run claude setup-token in a separate terminal first.
```

---

That is all. Claude Code can clone the repo, show the gallery, let you choose, and switch the buddy for you.
