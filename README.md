# Claude Code Buddy 重 Roll 攻略

> **重新 Roll 你的 `/buddy` 宠物，自由选择物种、稀有度，甚至 1% 的闪光变体。**

<p align="center">
  <img src="https://img.shields.io/badge/传说-gold?style=for-the-badge" alt="传说"/>
  <img src="https://img.shields.io/badge/闪光_1%25-blueviolet?style=for-the-badge" alt="闪光 1%"/>
  <img src="https://img.shields.io/badge/18_物种-teal?style=for-the-badge" alt="18 物种"/>
</p>

**🌐 语言: 中文 | [English](README.en.md) | [日本語](README.ja.md)**

---

## 最简单的方法

**直接把下面这段话粘贴发给你的 Claude Code，它会自动帮你搞定一切：**

```
帮我切换 Claude Code 的 /buddy 宠物。

步骤：
1. 先 clone 这个仓库（如果还没有的话）：git clone https://github.com/Zhao73/claude-buddy-reroll.git /tmp/buddy-reroll
2. 运行 node /tmp/buddy-reroll/switch.js 查看所有 18 种传说闪光宠物的外观和属性
3. 把所有宠物的名字、外观、属性展示给我看，问我想要哪一个
4. 我选好后，运行 node /tmp/buddy-reroll/switch.js <我选的物种名> 来切换
5. 告诉我需要怎么重启 Claude Code（需要用 CLAUDE_CODE_OAUTH_TOKEN 环境变量启动）

注意：如果我还没有 OAuth token，先在单独的终端运行 claude setup-token 获取。
```

> **就这么简单！** Claude Code 会自动 clone 仓库、展示宠物图鉴、让你选、帮你切换。

如果你更喜欢自己动手：

```bash
git clone https://github.com/Zhao73/claude-buddy-reroll.git
cd claude-buddy-reroll

# 浏览全部 18 种传说闪光宠物
node switch.js

# 切换到你喜欢的
node switch.js dragon

# 查看当前状态
node switch.js --status

# 恢复原来的宠物
node switch.js --restore
```

---

## 原理

Claude Code 的 `/buddy` 系统采用 **骨架 + 灵魂** 双层架构：

| 层 | 决定什么 | 种子 | 可修改？ |
|---|---------|------|---------|
| **骨架（Bones）** | 物种、稀有度、眼睛、帽子、闪光、属性 | `accountUuid` 或 `userID` | 见下方 |
| **灵魂（Soul）** | 名字、性格描述 | 孵化时由 Claude 生成 | 是（删除配置中的 `companion`） |

**骨架层** 使用 [FNV-1a](https://en.wikipedia.org/wiki/Fowler%E2%80%93Noll%E2%80%93Vo_hash_function) + [Mulberry32 PRNG](https://gist.github.com/tommyettinger/46a874533244883189143505d203312c) 哈希你的身份：

```
seed = FNV1a(userId + "friend-2026-401")
```

### 漏洞

当你使用 `CLAUDE_CODE_OAUTH_TOKEN` 环境变量登录时，Claude Code **不会把 `accountUuid` 写入** `~/.claude.json`。没有 `accountUuid`，`/buddy` 就会退而求其次读取 `userID` 字段——而这个字段你可以随便改。

---

## 稀有度分布

| 稀有度 | 权重 | 概率 | 星级 | 基础属性 |
|--------|------|------|------|---------|
| 普通 (Common) | 60 | 60% | ★ | 5 |
| 稀有 (Uncommon) | 25 | 25% | ★★ | 15 |
| 精良 (Rare) | 10 | 10% | ★★★ | 25 |
| 史诗 (Epic) | 4 | 4% | ★★★★ | 35 |
| **传说 (Legendary)** | **1** | **1%** | **★★★★★** | **50** |

**闪光（Shiny）** 是独立的 1% 概率，与稀有度无关。每个物种的 **传说闪光** 概率大约为 **0.0056%**（1/18000）。

---

## 全部 18 种物种

| # | 英文名 | 中文名 |
|---|--------|-------|
| 1 | duck | 鸭子 |
| 2 | goose | 鹅 |
| 3 | blob | 果冻 |
| 4 | cat | 猫 |
| 5 | dragon | 龙 |
| 6 | octopus | 章鱼 |
| 7 | owl | 猫头鹰 |
| 8 | penguin | 企鹅 |
| 9 | turtle | 乌龟 |
| 10 | snail | 蜗牛 |
| 11 | ghost | 幽灵 |
| 12 | axolotl | 六角恐龙 |
| 13 | capybara | 卡皮巴拉 |
| 14 | cactus | 仙人掌 |
| 15 | robot | 机器人 |
| 16 | rabbit | 兔子 |
| 17 | mushroom | 蘑菇 |
| 18 | chonk | 胖墩 |

### 外观选项

| 部位 | 选项 |
|------|-----|
| **眼睛** | `·` `✦` `×` `◉` `@` `°` |
| **帽子** | 无、皇冠、礼帽、螺旋桨帽、光环、巫师帽、毛线帽、小鸭帽 |

> 普通稀有度固定无帽。其他稀有度随机分配帽子。

---

## 五大属性

每只宠物有五个核心属性。随机一个为 **峰值**（最高），一个为 **低谷**（最低），其余为 **普通**。

| 属性 | 说明 |
|------|------|
| **DEBUGGING（调试）** | 找 bug 的直觉 |
| **PATIENCE（耐心）** | 对你犯错的容忍度 |
| **CHAOS（混乱）** | 制造混乱的倾向 |
| **WISDOM（智慧）** | 洞察力深度 |
| **SNARK（毒舌）** | 评论的毒舌程度 |

### 属性生成公式

| 类型 | 公式 | 传说级范围 |
|------|------|-----------|
| **峰值** | `min(100, 基础 + 50 + 随机(0~29))` | 100 |
| **低谷** | `max(1, 基础 - 10 + 随机(0~14))` | 40 ~ 54 |
| **普通** | `基础 + 随机(0~39)` | 50 ~ 89 |

峰值和低谷属性从五个属性中随机选取。

---

## 预刷传说闪光全集

所有物种的 **传说 + 闪光** 版本，经过实际 `/buddy` 输出验证，拿来即用。

### duck — 鸭子

```
      /^\     
      __      
    <(° )___  
     (  ._>   
      `--´    
```

| 稀有度 | 闪光 | 眼睛 | 帽子 | DEBUGGING | PATIENCE | CHAOS | WISDOM | SNARK |
|--------|------|------|------|-----------|----------|-------|--------|-------|
| ★★★★★ | ✨ | ° | 巫师帽 | 54 | **100** | 61 | 67 | 83 |

```
fbb064c6d0dc67b01121b757aab224f8a1c3876e85698663c8dd7d02117c3c0d
```

### goose — 鹅

```
      ,>      
       (◉>    
       ||     
     _(__)_   
      ^^^^    
```

| 稀有度 | 闪光 | 眼睛 | 帽子 | DEBUGGING | PATIENCE | CHAOS | WISDOM | SNARK |
|--------|------|------|------|-----------|----------|-------|--------|-------|
| ★★★★★ | ✨ | ◉ | 小鸭帽 | 64 | **100** | 41 | 51 | 78 |

```
e4b9555f102f85c16a6774ed2a7d6798c16fdcd03c14c0af79cb53e9620c08b4
```

### blob — 果冻

```
     (___)    
     .----.   
    ( @  @ )  
    (      )  
     `----´   
```

| 稀有度 | 闪光 | 眼睛 | 帽子 | DEBUGGING | PATIENCE | CHAOS | WISDOM | SNARK |
|--------|------|------|------|-----------|----------|-------|--------|-------|
| ★★★★★ | ✨ | @ | 毛线帽 | **100** | 46 | 76 | 86 | 83 |

```
469b08168a7c158cafce4688ee78fc192a2603e626a5646250069a5650b2b6a9
```

### cat — 猫

```
      -+-     
     /\_/\    
    ( ✦   ✦)  
    (  ω  )   
    (")_(")   
```

| 稀有度 | 闪光 | 眼睛 | 帽子 | DEBUGGING | PATIENCE | CHAOS | WISDOM | SNARK |
|--------|------|------|------|-----------|----------|-------|--------|-------|
| ★★★★★ | ✨ | ✦ | 螺旋桨帽 | 64 | 71 | 61 | 41 | **100** |

```
d1330a144e69962f6b631868a5e2a87de51582969412fa6e21556ed0fce560b6
```

### dragon — 龙

```
     \^^^/    
    /^\  /^\  
   <  @  @  > 
   (   ~~   ) 
    `-vvvv-´  
```

| 稀有度 | 闪光 | 眼睛 | 帽子 | DEBUGGING | PATIENCE | CHAOS | WISDOM | SNARK |
|--------|------|------|------|-----------|----------|-------|--------|-------|
| ★★★★★ | ✨ | @ | 皇冠 | **100** | 41 | 71 | 67 | 57 |

```
c9130b2ade6f668395281901c2cbe78c27d03d6cf1c552309b6ef34b11313742
```

### octopus — 章鱼

```
     (___)    
     .----.   
    ( °  ° )  
    (______)  
    /\/\/\/\  
```

| 稀有度 | 闪光 | 眼睛 | 帽子 | DEBUGGING | PATIENCE | CHAOS | WISDOM | SNARK |
|--------|------|------|------|-----------|----------|-------|--------|-------|
| ★★★★★ | ✨ | ° | 毛线帽 | 77 | **100** | 69 | 69 | 44 |

```
7008e44266d5ba07b12a302728729febe7265ee640b069f4288158dc44b26e63
```

### owl — 猫头鹰

```
      -+-     
     /\  /\   
    ((×)(×))  
    (  ><  )  
     `----´   
```

| 稀有度 | 闪光 | 眼睛 | 帽子 | DEBUGGING | PATIENCE | CHAOS | WISDOM | SNARK |
|--------|------|------|------|-----------|----------|-------|--------|-------|
| ★★★★★ | ✨ | × | 螺旋桨帽 | 84 | 53 | 54 | **100** | 72 |

```
e9f590be928a17e32664baa252e08edce6812dc86ed96abe3c06ae496c5d1950
```

### penguin — 企鹅

```
      /^\     
    .---.     
    (·>·)     
   /(   )\    
    `---´     
```

| 稀有度 | 闪光 | 眼睛 | 帽子 | DEBUGGING | PATIENCE | CHAOS | WISDOM | SNARK |
|--------|------|------|------|-----------|----------|-------|--------|-------|
| ★★★★★ | ✨ | · | 巫师帽 | 51 | 53 | **100** | 65 | 80 |

```
1c9aef4f3ef2ff9d561fdb467f120aee7ac244ff464347479b2d2b354e35dfb5
```

### turtle — 乌龟

```
     _,--._   
    ( °  ° )  
   /[______]\ 
    ``    ``  
```

| 稀有度 | 闪光 | 眼睛 | 帽子 | DEBUGGING | PATIENCE | CHAOS | WISDOM | SNARK |
|--------|------|------|------|-----------|----------|-------|--------|-------|
| ★★★★★ | ✨ | ° | 无 | **100** | 59 | 89 | 52 | 89 |

```
f287702f0e017d1f65599231d4c6a9ce53274d34e6090f0081d0194fd87df49c
```

### snail — 蜗牛

```
     [___]    
   @    .--.  
    \  ( @ )  
     \_`--´   
    ~~~~~~~   
```

| 稀有度 | 闪光 | 眼睛 | 帽子 | DEBUGGING | PATIENCE | CHAOS | WISDOM | SNARK |
|--------|------|------|------|-----------|----------|-------|--------|-------|
| ★★★★★ | ✨ | @ | 礼帽 | **100** | 89 | 64 | 67 | 42 |

```
a75398e61456425c7eeecd5fef2b567338d289a300669e5570db32b9cf4bafb3
```

### ghost — 幽灵

```
     [___]    
     .----.   
    / ◉  ◉ \  
    |      |  
    ~`~``~`~  
```

| 稀有度 | 闪光 | 眼睛 | 帽子 | DEBUGGING | PATIENCE | CHAOS | WISDOM | SNARK |
|--------|------|------|------|-----------|----------|-------|--------|-------|
| ★★★★★ | ✨ | ◉ | 礼帽 | 40 | 69 | 61 | **100** | 69 |

```
b4cf03d9615a11b13560c625d7c1f4e26a5960e7674c18c7084582d1542755f3
```

### axolotl — 六角恐龙

```
      ,>      
  }~(______)~{
  }~(° .. °)~{
    ( .--. )  
    (_/  \_)  
```

| 稀有度 | 闪光 | 眼睛 | 帽子 | DEBUGGING | PATIENCE | CHAOS | WISDOM | SNARK |
|--------|------|------|------|-----------|----------|-------|--------|-------|
| ★★★★★ | ✨ | ° | 小鸭帽 | **100** | 75 | 51 | 52 | 79 |

```
9afda6fae3735ad19bed7e55c826d3c4c16ab5b13fa4d869e8bce9de0c6df45c
```

### capybara — 卡皮巴拉

```
     (___)    
    n______n  
   ( ✦    ✦ ) 
   (   oo   ) 
    `------´  
```

| 稀有度 | 闪光 | 眼睛 | 帽子 | DEBUGGING | PATIENCE | CHAOS | WISDOM | SNARK |
|--------|------|------|------|-----------|----------|-------|--------|-------|
| ★★★★★ | ✨ | ✦ | 毛线帽 | 54 | 59 | 49 | **100** | 72 |

```
874d02aae1974e98baba8dbe60801ef48852f699764d418577785f8eb5ffbab8
```

### cactus — 仙人掌

```
   n  ____  n 
   | |✦  ✦| | 
   |_|    |_| 
     |    |   
```

| 稀有度 | 闪光 | 眼睛 | 帽子 | DEBUGGING | PATIENCE | CHAOS | WISDOM | SNARK |
|--------|------|------|------|-----------|----------|-------|--------|-------|
| ★★★★★ | ✨ | ✦ | 无 | 85 | 85 | 52 | **100** | 48 |

```
7fee8b175fdc2695508617ac3bbee7df00336e2bc6b1ad922b82dae22137b33e
```

### robot — 机器人

```
     \^^^/    
     .[||].   
    [ ·  · ]  
    [ ==== ]  
    `------´  
```

| 稀有度 | 闪光 | 眼睛 | 帽子 | DEBUGGING | PATIENCE | CHAOS | WISDOM | SNARK |
|--------|------|------|------|-----------|----------|-------|--------|-------|
| ★★★★★ | ✨ | · | 皇冠 | 87 | 44 | **100** | 55 | 63 |

```
259bd301a471b1ed2ea94d025e4bb601be653bb0563e7f49328287f13ff870a6
```

### rabbit — 兔子

```
     \^^^/    
     (\__/)   
    ( ·  · )  
   =(  ..  )= 
    (")__(")  
```

| 稀有度 | 闪光 | 眼睛 | 帽子 | DEBUGGING | PATIENCE | CHAOS | WISDOM | SNARK |
|--------|------|------|------|-----------|----------|-------|--------|-------|
| ★★★★★ | ✨ | · | 皇冠 | 64 | **100** | 75 | 78 | 51 |

```
cd32890107a4ae3bc74225437c8ab6aefbcc048a1e39fe34c3324c0667dcd50d
```

### mushroom — 蘑菇

```
   .-o-OO-o-. 
  (__________)
     |@  @|   
     |____|   
```

| 稀有度 | 闪光 | 眼睛 | 帽子 | DEBUGGING | PATIENCE | CHAOS | WISDOM | SNARK |
|--------|------|------|------|-----------|----------|-------|--------|-------|
| ★★★★★ | ✨ | @ | 无 | **100** | 74 | 53 | 89 | 52 |

```
901260021b10e33eab00b816579714d0e645f2543d71b4737339ca98cd7f88e2
```

### chonk — 胖墩

```
      ,>      
    /\    /\  
   ( ◉    ◉ ) 
   (   ..   ) 
    `------´  
```

| 稀有度 | 闪光 | 眼睛 | 帽子 | DEBUGGING | PATIENCE | CHAOS | WISDOM | SNARK |
|--------|------|------|------|-----------|----------|-------|--------|-------|
| ★★★★★ | ✨ | ◉ | 小鸭帽 | **100** | 64 | 82 | 58 | 53 |

```
1834011daac05773368eb3ff1d28cd3bf939043be89533e8678cd53ec632096a
```

---

## 手动教程

### 前提条件

- 已安装 Claude Code（`npm install -g @anthropic-ai/claude-code`）
- Claude Max / Pro 订阅（OAuth 登录）
- Node.js 18+

### 第一步：获取 OAuth Token

打开 **单独的终端**（不是在 Claude Code 里面）：

```bash
claude setup-token
```

复制以 `sk-ant-oat01-...` 开头的 token。

### 第二步：备份配置

```bash
cp ~/.claude.json ~/.claude.json.backup
```

### 第三步：切换宠物

从上面的 [预刷全集](#预刷传说闪光全集) 中选一个 `userID`，然后运行：

```bash
node apply.js 你选的ID粘贴到这里
```

或者手动操作：

```bash
node -e "
const fs = require('fs');
const path = process.env.HOME + '/.claude.json';
const config = JSON.parse(fs.readFileSync(path, 'utf8'));

// 删除 accountUuid，让 /buddy 退而求其次读取 userID
if (config.oauthAccount) delete config.oauthAccount.accountUuid;

// 设置你选的 userID（示例：传说闪光龙）
config.userID = '你选的ID粘贴到这里';

// 清除 companion 触发重新孵化
delete config.companion;

fs.writeFileSync(path, JSON.stringify(config, null, 2));
console.log('搞定！');
"
```

### 第四步：用 OAuth Token 启动

```bash
export CLAUDE_CODE_OAUTH_TOKEN="sk-ant-oat01-你的TOKEN"
claude
```

### 第五步：孵化！

在 Claude Code 里输入：

```
/buddy
```

你的新传说闪光宠物将会以全新的名字和性格孵化出来。

### 恢复

出了问题可以恢复：

```bash
node apply.js --restore
# 或者手动：
cp ~/.claude.json.backup ~/.claude.json
```

---

## 自定义暴力搜索

想要特定组合？使用 `finder.js`：

```bash
# 找传说闪光卡皮巴拉
node finder.js capybara legendary true

# 找史诗龙（不要求闪光）
node finder.js dragon epic false

# 找任意传说闪光
node finder.js any legendary true
```

输出示例：

```
╔══════════════════════════════════════════════════╗
║       Claude Code Buddy Finder                  ║
╚══════════════════════════════════════════════════╝

  Target: legendary shiny capybara
  Finding 3 result(s)...

  ┌─ Result #1 ─────────────────────────────
  │ Species: capybara (卡皮巴拉)
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

## 技术细节

### 算法

```
输入    = userID + "friend-2026-401"
哈希    = FNV-1a(输入)              → 32位整数
随机数  = Mulberry32(哈希)          → 确定性伪随机数生成器

稀有度  = 加权随机(rng)             → [60% 普通 ... 1% 传说]
物种    = 均匀随机(rng, 18)         → 18 种之一
眼睛    = 均匀随机(rng, 6)          → 6 种眼睛之一
帽子    = 均匀随机(rng, 8)          → 8 种帽子之一（普通 = 无帽）
闪光    = rng() < 0.01             → 独立 1% 概率

峰值    = pick(rng, 属性)           → 一个属性拉满
低谷    = pick(rng, 属性) ≠ 峰值   → 一个属性拉低
属性    = 对每个属性：
            峰值 → min(100, 基础 + 50 + floor(rng() * 30))
            低谷 → max(1,   基础 - 10 + floor(rng() * 15))
            普通 → 基础 + floor(rng() * 40)
```

### 为什么 `accountUuid` 绕过有效

```
正常登录：          accountUuid → 写入 ~/.claude.json → /buddy 使用它
OAuth Token 登录：  accountUuid → 不写入              → /buddy 使用 userID
```

`userID` 只是 `~/.claude.json` 中的一个本地字段，你可以设置为任意字符串。不同的字符串通过哈希函数会产生不同的宠物。

---

## 声明

这只是一个针对趣味彩蛋功能的纯外观修改。不影响 Claude Code 的功能、计费或账号安全。你的 OAuth token 和订阅不受影响。

## 许可证

MIT
