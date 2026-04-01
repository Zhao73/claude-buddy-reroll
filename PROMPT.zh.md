# 傻瓜式切换 — 直接发给 Claude Code

把下面这段话复制粘贴发给你的 Claude Code 即可，它会自动帮你完成一切：

---

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

---

就这么简单！Claude Code 会帮你搞定一切。
