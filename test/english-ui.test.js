const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const REPO_ROOT = path.resolve(__dirname, "..");
const CJK_REGEX = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u;

function readRepoFile(relPath) {
  return fs.readFileSync(path.join(REPO_ROOT, relPath), "utf8");
}

function makeTempHome(config) {
  const homeDir = fs.mkdtempSync(path.join(os.tmpdir(), "buddy-reroll-home-"));
  fs.writeFileSync(path.join(homeDir, ".claude.json"), JSON.stringify(config, null, 2));
  return homeDir;
}

function runNode(scriptName, args = [], extraEnv = {}) {
  const result = spawnSync(process.execPath, [path.join(REPO_ROOT, scriptName), ...args], {
    cwd: REPO_ROOT,
    env: { ...process.env, ...extraEnv },
    encoding: "utf8",
  });

  if (result.error) {
    throw result.error;
  }

  return result;
}

function assertNoCjk(text, label) {
  assert.equal(
    CJK_REGEX.test(text),
    false,
    `${label} should not contain Chinese or Japanese characters.\n\n${text}`,
  );
}

test("English-facing docs stay fully English", () => {
  for (const file of ["README.md", "README.en.md", "PROMPT.md"]) {
    assertNoCjk(readRepoFile(file), file);
  }
});

test("switch.js status output stays fully English", () => {
  const homeDir = makeTempHome({
    userID: "1234567890abcdef1234567890abcdef",
    oauthAccount: { accountUuid: "locked-account-id" },
    companion: { name: "Buddy" },
  });
  const result = runNode("switch.js", ["--status"], { HOME: homeDir });

  assert.equal(result.status, 0, result.stderr);
  assertNoCjk(result.stdout, "switch.js --status");
});

test("switch.js apply flow stays fully English", () => {
  const homeDir = makeTempHome({
    userID: "abcdefabcdefabcdefabcdefabcdefab",
    oauthAccount: { accountUuid: "locked-account-id" },
    companion: { name: "Buddy" },
  });
  const result = runNode("switch.js", ["dragon"], { HOME: homeDir });

  assert.equal(result.status, 0, result.stderr);
  assertNoCjk(result.stdout, "switch.js dragon");
});

test("finder.js output stays fully English", () => {
  const result = runNode("finder.js", ["any", "legendary", "true", "1"]);

  assert.equal(result.status, 0, result.stderr);
  assertNoCjk(result.stdout, "finder.js any legendary true 1");
});
