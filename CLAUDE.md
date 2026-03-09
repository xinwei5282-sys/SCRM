# SCRM 项目指引

## 项目信息

- **产品**：生财有术 SCRM
- **定位**：知识付费社群运营管理工具
- **移动端优先**：设计基准 375px

## 设计基础（所有角色必读）

@.claude/design-foundation.md

## 角色体系（OpenClaw）

项目使用 OpenClaw 角色提示词（`~/.openclaw/agents/`），不使用 BMAD Method。

| 命令 | 角色 | 名字 | 提示词来源 |
|------|------|------|-----------|
| `/pm` | 🎯 产品经理 | 明策 | `~/.openclaw/agents/pm/agent/SOUL.md` + `AGENTS.md` |
| `/dev` | ⚡ 全栈开发 | 码匠 | `~/.openclaw/agents/dev/agent/SOUL.md` + `AGENTS.md` |
| `/ui` | 🎨 UI/UX 设计师 | 绘心 | `~/.openclaw/agents/design/agent/IDENTITY.md` (SOUL.md 待完善) |

> OpenClaw 完整团队还包括：墨言(内容)、拓客(增长)、算盘(财务)、律己(法务)、守卫(运维)、暖客(客服)

## 项目文档结构

```
/SCRM
├── CLAUDE.md                  # 项目指引（本文件）
├── PRD.md                     # PRD 索引（模块清单入口）
├── PRD_*.md                   # 各功能模块 PRD（PRD_新手任务.md, PRD_企微侧边栏.md）
├── UI_Design.md               # UI 设计方案（通用）
├── UI_Design_*.md             # 各功能模块 UI 设计
├── progress.json              # 任务编排进度
├── claude-progress.txt        # 会话进度笔记
├── prototype/                 # HTML 原型（用于 Figma 捕获）
├── .claude/
│   ├── design-foundation.md   # 设计基础（唯一真相来源）
│   ├── ui-check-protocol.md   # UI 还原检查协议（强制执行）
│   └── commands/              # 项目级角色命令
│       ├── pm.md              # 明策 — 产品经理
│       ├── ui.md              # 绘心 — UI/UX 设计师
│       └── dev.md             # 码匠 — 全栈开发
└── src/                       # 源代码
```

## 工作规则

1. **设计一致性**：所有涉及 UI 的工作必须遵循 `.claude/design-foundation.md` 中的 Token
2. **文档先行**：新功能先写 PRD，再写 UI 设计方案，再编码
3. **命名规范**：
   - PRD 文档：`PRD_功能名.md`
   - UI 文档：`UI_Design_功能名.md`
   - HTML 原型：`prototype/功能名.html`
4. **设计变更流程**：修改设计 Token → 更新 `design-foundation.md` → 同步代码和设计稿
5. **UI 还原检查（强制）**：每次修改 HTML 原型后，必须执行 `.claude/ui-check-protocol.md` 中的 5 步检查法。.pen 设计稿是唯一真相来源，不凭记忆编码。
