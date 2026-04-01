**🌐 Language: [中文](README.md) | [English](README.en.md) | 日本語**

# Claude Code Buddy リロールガイド

> **`/buddy` ペットをリロールして、好きな種族・レアリティ・1%のシャイニーを手に入れよう。**

<p align="center">
  <img src="https://img.shields.io/badge/Legendary-gold?style=for-the-badge" alt="Legendary"/>
  <img src="https://img.shields.io/badge/Shiny_1%25-blueviolet?style=for-the-badge" alt="Shiny 1%"/>
  <img src="https://img.shields.io/badge/18_Species-teal?style=for-the-badge" alt="18 Species"/>
</p>

## クイックスタート — 一番簡単な方法

**以下のプロンプトをそのまま Claude Code に貼り付けてください。自動で全部やってくれます：**

```
Claude Code の /buddy ペットを切り替えてほしい。

手順：
1. まだクローンしていなければ、このリポジトリをクローンする：git clone https://github.com/Zhao73/claude-buddy-reroll.git /tmp/buddy-reroll
2. node /tmp/buddy-reroll/switch.js を実行して、18種類のレジェンダリーシャイニーペットの外見とステータスを確認する
3. 全ペットの名前・外見・ステータスを見せてくれて、どれが欲しいか聞いてほしい
4. 選んだら、node /tmp/buddy-reroll/switch.js <選んだ種族名> を実行して切り替える
5. Claude Code の再起動方法を教えてほしい（CLAUDE_CODE_OAUTH_TOKEN 環境変数で起動する必要がある）

注意：まだ OAuth トークンを持っていない場合は、別のターミナルで claude setup-token を実行して取得する。
```

> **以上です！** Claude Code がリポジトリをクローンし、18種類のペットを表示し、選択後に切り替えてくれます。

自分で操作したい場合は、インタラクティブスイッチャーを使ってください：

```bash
git clone https://github.com/Zhao73/claude-buddy-reroll.git
cd claude-buddy-reroll

# 18種類のレジェンダリーシャイニーペットを一覧表示
node switch.js

# お気に入りに切り替え
node switch.js dragon

# 現在のステータスを確認
node switch.js --status

# 元のバディに戻す
node switch.js --restore
```

---

## 仕組み

Claude Code の `/buddy` システムは **Bones + Soul** アーキテクチャを採用しています：

| レイヤー | 決定する要素 | シード | 変更可能？ |
|---------|------------|--------|----------|
| **Bones**（外見） | 種族、レアリティ、目、帽子、シャイニー、ステータス | `accountUuid` または `userID` | 後述 |
| **Soul**（性格） | 名前、性格の説明 | 孵化時に Claude が生成 | 可（設定の `companion` を削除） |

**Bones** レイヤーはあなたのIDを [FNV-1a](https://en.wikipedia.org/wiki/Fowler%E2%80%93Noll%E2%80%93Vo_hash_function) + [Mulberry32 PRNG](https://gist.github.com/tommyettinger/46a874533244883189143505d203312c) でハッシュします。シードは以下の通り：

```
seed = FNV1a(userId + "friend-2026-401")
```

### 抜け穴

`CLAUDE_CODE_OAUTH_TOKEN` 環境変数でログインすると、Claude Code は `~/.claude.json` に **`accountUuid` を書き込みません**。`accountUuid` がない場合、`/buddy` は `userID` フィールドにフォールバックします — このフィールドは自由に編集できます。

---

## レアリティ分布

| レアリティ | ウェイト | 確率 | スター | 基本ステータス |
|-----------|---------|------|--------|-------------|
| Common | 60 | 60% | ★ | 5 |
| Uncommon | 25 | 25% | ★★ | 15 |
| Rare | 10 | 10% | ★★★ | 25 |
| Epic | 4 | 4% | ★★★★ | 35 |
| **Legendary** | **1** | **1%** | **★★★★★** | **50** |

**シャイニー** はレアリティとは独立した1%の判定です。**レジェンダリーシャイニー** の各種族あたりの出現率は約 **0.0056%**（1/18000）です。

---

## 全18種族

| | 種族 | 日本語名 |
|---|---------|---------|
| 1 | duck | アヒル |
| 2 | goose | ガチョウ |
| 3 | blob | スライム |
| 4 | cat | ネコ |
| 5 | dragon | ドラゴン |
| 6 | octopus | タコ |
| 7 | owl | フクロウ |
| 8 | penguin | ペンギン |
| 9 | turtle | カメ |
| 10 | snail | カタツムリ |
| 11 | ghost | ゴースト |
| 12 | axolotl | ウーパールーパー |
| 13 | capybara | カピバラ |
| 14 | cactus | サボテン |
| 15 | robot | ロボット |
| 16 | rabbit | ウサギ |
| 17 | mushroom | キノコ |
| 18 | chonk | まるまる |

### 外見オプション

| パーツ | 選択肢 |
|--------|--------|
| **目** | `·` `✦` `×` `◉` `@` `°` |
| **帽子** | none, crown, tophat, propeller, halo, wizard, beanie, tinyduck |

> Common レアリティは常に `hat: none` です。その他のレアリティはランダムで帽子が選ばれます。

---

## 5つのステータス

各バディには5つのコア属性があります。1つがランダムにブースト（**ピーク**）、1つが弱体化（**バレー**）、残りは**通常**です。

| ステータス | 説明 |
|-----------|------|
| **DEBUGGING** | バグ発見の直感 |
| **PATIENCE** | あなたのミスに対する寛容さ |
| **CHAOS** | 混乱を引き起こす傾向 |
| **WISDOM** | 洞察の深さ |
| **SNARK** | コメントの皮肉レベル |

### ステータス生成の計算式

| タイプ | 計算式 | レジェンダリーの範囲 |
|--------|--------|-------------------|
| **ピーク** | `min(100, base + 50 + random(0~29))` | 100 |
| **バレー** | `max(1, base - 10 + random(0~14))` | 40 ~ 54 |
| **通常** | `base + random(0~39)` | 50 ~ 89 |

ピークとバレーのステータスは、同じ PRNG シーケンスを使って5つの属性からランダムに選ばれます。

---

## レジェンダリーシャイニー事前生成コレクション

全種族の **レジェンダリー + シャイニー** が使用可能です。ステータスは実際の `/buddy` 出力で検証済みです。

### duck — アヒル

```
      /^\     
      __      
    <(° )___  
     (  ._>   
      `--´    
```

| レアリティ | シャイニー | 目 | 帽子 | DEBUGGING | PATIENCE | CHAOS | WISDOM | SNARK |
|-----------|----------|-----|------|-----------|----------|-------|--------|-------|
| ★★★★★ | ✨ | ° | wizard | 54 | **100** | 61 | 67 | 83 |

```
fbb064c6d0dc67b01121b757aab224f8a1c3876e85698663c8dd7d02117c3c0d
```

### goose — ガチョウ

```
      ,>      
       (◉>    
       ||     
     _(__)_   
      ^^^^    
```

| レアリティ | シャイニー | 目 | 帽子 | DEBUGGING | PATIENCE | CHAOS | WISDOM | SNARK |
|-----------|----------|-----|------|-----------|----------|-------|--------|-------|
| ★★★★★ | ✨ | ◉ | tinyduck | 64 | **100** | 41 | 51 | 78 |

```
e4b9555f102f85c16a6774ed2a7d6798c16fdcd03c14c0af79cb53e9620c08b4
```

### blob — スライム

```
     (___)    
     .----.   
    ( @  @ )  
    (      )  
     `----´   
```

| レアリティ | シャイニー | 目 | 帽子 | DEBUGGING | PATIENCE | CHAOS | WISDOM | SNARK |
|-----------|----------|-----|------|-----------|----------|-------|--------|-------|
| ★★★★★ | ✨ | @ | beanie | **100** | 46 | 76 | 86 | 83 |

```
469b08168a7c158cafce4688ee78fc192a2603e626a5646250069a5650b2b6a9
```

### cat — ネコ

```
      -+-     
     /\_/\    
    ( ✦   ✦)  
    (  ω  )   
    (")_(")   
```

| レアリティ | シャイニー | 目 | 帽子 | DEBUGGING | PATIENCE | CHAOS | WISDOM | SNARK |
|-----------|----------|-----|------|-----------|----------|-------|--------|-------|
| ★★★★★ | ✨ | ✦ | propeller | 64 | 71 | 61 | 41 | **100** |

```
d1330a144e69962f6b631868a5e2a87de51582969412fa6e21556ed0fce560b6
```

### dragon — ドラゴン

```
     \^^^/    
    /^\  /^\  
   <  @  @  > 
   (   ~~   ) 
    `-vvvv-´  
```

| レアリティ | シャイニー | 目 | 帽子 | DEBUGGING | PATIENCE | CHAOS | WISDOM | SNARK |
|-----------|----------|-----|------|-----------|----------|-------|--------|-------|
| ★★★★★ | ✨ | @ | crown | **100** | 41 | 71 | 67 | 57 |

```
c9130b2ade6f668395281901c2cbe78c27d03d6cf1c552309b6ef34b11313742
```

### octopus — タコ

```
     (___)    
     .----.   
    ( °  ° )  
    (______)  
    /\/\/\/\  
```

| レアリティ | シャイニー | 目 | 帽子 | DEBUGGING | PATIENCE | CHAOS | WISDOM | SNARK |
|-----------|----------|-----|------|-----------|----------|-------|--------|-------|
| ★★★★★ | ✨ | ° | beanie | 77 | **100** | 69 | 69 | 44 |

```
7008e44266d5ba07b12a302728729febe7265ee640b069f4288158dc44b26e63
```

### owl — フクロウ

```
      -+-     
     /\  /\   
    ((×)(×))  
    (  ><  )  
     `----´   
```

| レアリティ | シャイニー | 目 | 帽子 | DEBUGGING | PATIENCE | CHAOS | WISDOM | SNARK |
|-----------|----------|-----|------|-----------|----------|-------|--------|-------|
| ★★★★★ | ✨ | × | propeller | 84 | 53 | 54 | **100** | 72 |

```
e9f590be928a17e32664baa252e08edce6812dc86ed96abe3c06ae496c5d1950
```

### penguin — ペンギン

```
      /^\     
    .---.     
    (·>·)     
   /(   )\    
    `---´     
```

| レアリティ | シャイニー | 目 | 帽子 | DEBUGGING | PATIENCE | CHAOS | WISDOM | SNARK |
|-----------|----------|-----|------|-----------|----------|-------|--------|-------|
| ★★★★★ | ✨ | · | wizard | 51 | 53 | **100** | 65 | 80 |

```
1c9aef4f3ef2ff9d561fdb467f120aee7ac244ff464347479b2d2b354e35dfb5
```

### turtle — カメ

```
     _,--._   
    ( °  ° )  
   /[______]\ 
    ``    ``  
```

| レアリティ | シャイニー | 目 | 帽子 | DEBUGGING | PATIENCE | CHAOS | WISDOM | SNARK |
|-----------|----------|-----|------|-----------|----------|-------|--------|-------|
| ★★★★★ | ✨ | ° | none | **100** | 59 | 89 | 52 | 89 |

```
f287702f0e017d1f65599231d4c6a9ce53274d34e6090f0081d0194fd87df49c
```

### snail — カタツムリ

```
     [___]    
   @    .--.  
    \  ( @ )  
     \_`--´   
    ~~~~~~~   
```

| レアリティ | シャイニー | 目 | 帽子 | DEBUGGING | PATIENCE | CHAOS | WISDOM | SNARK |
|-----------|----------|-----|------|-----------|----------|-------|--------|-------|
| ★★★★★ | ✨ | @ | tophat | **100** | 89 | 64 | 67 | 42 |

```
a75398e61456425c7eeecd5fef2b567338d289a300669e5570db32b9cf4bafb3
```

### ghost — ゴースト

```
     [___]    
     .----.   
    / ◉  ◉ \  
    |      |  
    ~`~``~`~  
```

| レアリティ | シャイニー | 目 | 帽子 | DEBUGGING | PATIENCE | CHAOS | WISDOM | SNARK |
|-----------|----------|-----|------|-----------|----------|-------|--------|-------|
| ★★★★★ | ✨ | ◉ | tophat | 40 | 69 | 61 | **100** | 69 |

```
b4cf03d9615a11b13560c625d7c1f4e26a5960e7674c18c7084582d1542755f3
```

### axolotl — ウーパールーパー

```
      ,>      
  }~(______)~{
  }~(° .. °)~{
    ( .--. )  
    (_/  \_)  
```

| レアリティ | シャイニー | 目 | 帽子 | DEBUGGING | PATIENCE | CHAOS | WISDOM | SNARK |
|-----------|----------|-----|------|-----------|----------|-------|--------|-------|
| ★★★★★ | ✨ | ° | tinyduck | **100** | 75 | 51 | 52 | 79 |

```
9afda6fae3735ad19bed7e55c826d3c4c16ab5b13fa4d869e8bce9de0c6df45c
```

### capybara — カピバラ

```
     (___)    
    n______n  
   ( ✦    ✦ ) 
   (   oo   ) 
    `------´  
```

| レアリティ | シャイニー | 目 | 帽子 | DEBUGGING | PATIENCE | CHAOS | WISDOM | SNARK |
|-----------|----------|-----|------|-----------|----------|-------|--------|-------|
| ★★★★★ | ✨ | ✦ | beanie | 54 | 59 | 49 | **100** | 72 |

```
874d02aae1974e98baba8dbe60801ef48852f699764d418577785f8eb5ffbab8
```

### cactus — サボテン

```
   n  ____  n 
   | |✦  ✦| | 
   |_|    |_| 
     |    |   
```

| レアリティ | シャイニー | 目 | 帽子 | DEBUGGING | PATIENCE | CHAOS | WISDOM | SNARK |
|-----------|----------|-----|------|-----------|----------|-------|--------|-------|
| ★★★★★ | ✨ | ✦ | none | 85 | 85 | 52 | **100** | 48 |

```
7fee8b175fdc2695508617ac3bbee7df00336e2bc6b1ad922b82dae22137b33e
```

### robot — ロボット

```
     \^^^/    
     .[||].   
    [ ·  · ]  
    [ ==== ]  
    `------´  
```

| レアリティ | シャイニー | 目 | 帽子 | DEBUGGING | PATIENCE | CHAOS | WISDOM | SNARK |
|-----------|----------|-----|------|-----------|----------|-------|--------|-------|
| ★★★★★ | ✨ | · | crown | 87 | 44 | **100** | 55 | 63 |

```
259bd301a471b1ed2ea94d025e4bb601be653bb0563e7f49328287f13ff870a6
```

### rabbit — ウサギ

```
     \^^^/    
     (\__/)   
    ( ·  · )  
   =(  ..  )= 
    (")__(")  
```

| レアリティ | シャイニー | 目 | 帽子 | DEBUGGING | PATIENCE | CHAOS | WISDOM | SNARK |
|-----------|----------|-----|------|-----------|----------|-------|--------|-------|
| ★★★★★ | ✨ | · | crown | 64 | **100** | 75 | 78 | 51 |

```
cd32890107a4ae3bc74225437c8ab6aefbcc048a1e39fe34c3324c0667dcd50d
```

### mushroom — キノコ

```
   .-o-OO-o-. 
  (__________)
     |@  @|   
     |____|   
```

| レアリティ | シャイニー | 目 | 帽子 | DEBUGGING | PATIENCE | CHAOS | WISDOM | SNARK |
|-----------|----------|-----|------|-----------|----------|-------|--------|-------|
| ★★★★★ | ✨ | @ | none | **100** | 74 | 53 | 89 | 52 |

```
901260021b10e33eab00b816579714d0e645f2543d71b4737339ca98cd7f88e2
```

### chonk — まるまる

```
      ,>      
    /\    /\  
   ( ◉    ◉ ) 
   (   ..   ) 
    `------´  
```

| レアリティ | シャイニー | 目 | 帽子 | DEBUGGING | PATIENCE | CHAOS | WISDOM | SNARK |
|-----------|----------|-----|------|-----------|----------|-------|--------|-------|
| ★★★★★ | ✨ | ◉ | tinyduck | **100** | 64 | 82 | 58 | 53 |

```
1834011daac05773368eb3ff1d28cd3bf939043be89533e8678cd53ec632096a
```

---

## ステップバイステップガイド

### 前提条件

- Claude Code がインストール済み（`npm install -g @anthropic-ai/claude-code`）
- Claude Max / Pro サブスクリプション（OAuth ログイン）
- Node.js 18+

### ステップ 1: OAuth トークンを取得する

**別のターミナル**（Claude Code の中ではなく）を開いてください：

```bash
claude setup-token
```

`sk-ant-oat01-...` で始まるトークンをコピーします。

### ステップ 2: 設定をバックアップする

```bash
cp ~/.claude.json ~/.claude.json.backup
```

### ステップ 3: `accountUuid` を削除してターゲットの `userID` を設定する

上の[レジェンダリーシャイニー事前生成コレクション](#レジェンダリーシャイニー事前生成コレクション)から `userID` を選び、以下を実行します：

```bash
node apply.js PASTE_YOUR_CHOSEN_ID_HERE
```

または手動で：

```bash
node -e "
const fs = require('fs');
const path = process.env.HOME + '/.claude.json';
const config = JSON.parse(fs.readFileSync(path, 'utf8'));

// accountUuid を削除して /buddy が userID にフォールバックするようにする
if (config.oauthAccount) delete config.oauthAccount.accountUuid;

// 選んだ userID を設定する（例：レジェンダリーシャイニードラゴン）
config.userID = 'PASTE_YOUR_CHOSEN_ID_HERE';

// companion をクリアして再孵化をトリガーする
delete config.companion;

fs.writeFileSync(path, JSON.stringify(config, null, 2));
console.log('Done!');
"
```

### ステップ 4: OAuth トークンで起動する

```bash
export CLAUDE_CODE_OAUTH_TOKEN="sk-ant-oat01-YOUR_TOKEN_HERE"
claude
```

### ステップ 5: 孵化！

Claude Code の中で以下を入力します：

```
/buddy
```

新しいレジェンダリーシャイニーバディが、新しい名前と性格で孵化します。

### ロールバック

何か問題が起きた場合：

```bash
node apply.js --restore
# または手動で：
cp ~/.claude.json.backup ~/.claude.json
```

---

## カスタムブルートフォーススクリプト

特定の組み合わせが欲しい場合は、付属の `finder.js` を使ってください：

```bash
# レジェンダリーシャイニーのカピバラを探す
node finder.js capybara legendary true

# エピックのドラゴンを探す（シャイニー不問）
node finder.js dragon epic false

# レジェンダリーシャイニーなら種族は問わない
node finder.js any legendary true
```

出力例：

```
╔══════════════════════════════════════════════════╗
║       Claude Code Buddy Finder                  ║
╚══════════════════════════════════════════════════╝

  Target: legendary shiny capybara
  Finding 3 result(s)...

  ┌─ Result #1 ─────────────────────────────
  │ Species: capybara (カピバラ)
  │ Rarity:  ★★★★★ legendary
  │ Shiny:   ✨ YES
  │ Eye:     ✦    Hat: beanie
  │
  │ DEBUGGING  ██████████░░░░░░░░░░ 54
  │ PATIENCE   ███████████░░░░░░░░░ 59
  │ CHAOS      █████████░░░░░░░░░░░ 49
  │ WISDOM     ████████████████████ 100
  │ SNARK      ██████████████░░░░░░ 72
  │
  │ UserID: 874d02aae1974e98baba8dbe60801ef4...
  └─ (112,345 checked, 0.2s)
```

---

## 技術的な詳細

### アルゴリズム

```
input   = userID + "friend-2026-401"
hash    = FNV-1a(input)             → 32ビット整数
rng     = Mulberry32(hash)          → 決定論的 PRNG

rarity  = weightedPick(rng)         → [60% common ... 1% legendary]
species = uniformPick(rng, 18)      → 18種族から1つ
eye     = uniformPick(rng, 6)       → 6種類の目から1つ
hat     = uniformPick(rng, 8)       → 8種類の帽子から1つ（common = none）
shiny   = rng() < 0.01             → 独立した1%の確率

peak    = pick(rng, STATS)          → 1つのステータスがブースト
valley  = pick(rng, STATS) ≠ peak  → 1つのステータスが弱体化
stats   = for each stat:
            peak   → min(100, base + 50 + floor(rng() * 30))
            valley → max(1,   base - 10 + floor(rng() * 15))
            normal → base + floor(rng() * 40)
```

### なぜ `accountUuid` バイパスが機能するのか

```
通常ログイン:        accountUuid → ~/.claude.json に書き込まれる → /buddy がこれを使用
OAuth トークンログイン: accountUuid → 書き込まれない              → /buddy が userID を使用
```

`userID` は `~/.claude.json` 内のローカルフィールドに過ぎないため、任意の文字列に設定できます。異なる文字列はハッシュ関数を通じて異なるペットを生成します。

---

## 免責事項

これはお楽しみのイースターエッグ機能に対する見た目だけの変更です。Claude Code の機能、課金、アカウントセキュリティには影響しません。OAuth トークンとサブスクリプションは変更されません。

## ライセンス

MIT
