# 新手任务系统 UI 设计方案（移动端）

> 设计基础：`.claude/design-foundation.md`（颜色、字体、间距、圆角、组件规范等所有 Token 定义均以该文件为准）
> 设计语言：Nova 紧凑布局（容器 padding 16px, gap 16px, btn 32px, radius-btn 6px, radius-card 8px）
> 版本：v1.1 | 更新：2026-02-28（Nova 规范对齐 + 状态设计补充）

---

## 1. 页面设计

### 1.1 Screen 1：首页（含新手任务弹窗）

#### 页面结构

```
┌─────────────────────────────┐
│  状态栏 44px                 │ --color-fill-1 背景
├─────────────────────────────┤
│  导航栏 "首页" 48px          │ --color-fill-1 背景
├─────────────────────────────┤
│  悬浮入口 45px               │ #FFFBF0 背景
├─────────────────────────────┤
│                             │
│  首页内容区                   │ --color-surface-canvas
│                             │
├─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┤
│  ┌───────────────────────┐  │
│  │ 弹窗遮罩               │  │ --color-overlay (80%)
│  │  ┌─────────────────┐  │  │
│  │  │ 橙色渐变头部 🎓  │  │  │ --gradient-accent-full
│  │  │                 │  │  │
│  │  ├─────────────────┤  │  │
│  │  │ "完成新手任务     │  │  │ --color-text-1
│  │  │  开启赚钱第一课"  │  │  │
│  │  │                 │  │  │
│  │  │  [去完成] CTA    │  │  │ --color-primary-6
│  │  └─────────────────┘  │  │
│  └───────────────────────┘  │
└─────────────────────────────┘
```

#### 元素规格

| 元素 | 属性 | Token / 值 |
|------|------|-----------|
| 状态栏 | 高度 44px, 背景 | `--color-fill-1` |
| 导航栏 | 高度 48px, 标题 | `--text-m-h2-bold`, `--color-text-1` |
| 导航栏 | 底部边框 | 0.5px solid `--color-border-default` |
| 悬浮入口 | 高度 45px, 背景 | #FFFBF0, 底部 0.5px #F0E6CC |
| 悬浮入口文字 | | `--text-m-body`, `--color-text-1` |
| 悬浮入口关闭 | | 18px, `--color-text-4` |
| 内容区 | 背景 | `--color-surface-canvas` |
| 弹窗遮罩 | | `--color-overlay` (80%) |
| 弹窗容器 | 宽度 300px | `--color-fill-1`, `--radius-card` (8px) |
| 弹窗头部 | 高度 200px | `--gradient-accent-full` |
| 弹窗图标 | 🎓 | 64px |
| 弹窗关闭按钮 | 28px 圆形 | `--color-overlay-a40`, `--color-text-7` |
| 弹窗标题 | | `--text-m-h1` 18px/700, `--color-text-1` |
| CTA 按钮 | 144×46px | `--color-primary-6`, `--radius-btn` (6px) |
| CTA 按钮文字 | | `--text-m-h2-bold`, `--color-text-7` |

### 1.2 Screen 2：新手任务页面

#### 页面结构

```
┌─────────────────────────────┐
│  状态栏 44px (深色)           │ 深色主题背景
├─────────────────────────────┤
│  ‹ 返回  (nav 48px)         │
│  "完成新手任务，              │ --text-m-h1, --color-text-7
│   开启你的赚钱第一课"         │
│  "完成以下任务快速融入生财"    │ --text-m-sm, inverse-a60
│  ┌───────────────────────┐  │
│  │ 任务进度      1/3 已完成│  │ --color-accent-orange-6
│  │ ████░░░░░░░░░░░░░░░░ │  │ --gradient-progress
│  └───────────────────────┘  │
├─────────────────────────────┤
│  ┌───────────────────────┐  │ --color-surface-canvas
│  │ 绑定星球账号    [去绑定]│  │
│  │ 同步你在知识星球的会员身份│ │
│  └───────────────────────┘  │
│  ┌───────────────────────┐  │
│  │ 扫码添加鱼丸   [已添加]│  │ 已完成态
│  │ 获取专属社群服务       │  │
│  └───────────────────────┘  │
│  ┌───────────────────────┐  │
│  │ 填写新人登记表  [去填写]│  │
│  │ 让我们更了解你的需求   │  │
│  └───────────────────────┘  │
└─────────────────────────────┘
```

#### 元素规格

| 元素 | 属性 | Token / 值 |
|------|------|-----------|
| 深色头部背景 | 渐变 | `--gradient-dark-header` |
| 状态栏文字 | | `--color-text-7` |
| 返回按钮 | 22px | `--color-text-7` |
| 页面标题 | | `--text-m-h1` 18px/700, `--color-text-7` |
| 副标题 | | `--text-m-sm`, `--color-inverse-a60` |
| 进度卡片 | 圆角 | `--color-inverse-a12`, `--radius-card` (8px) |
| 进度标签 | | `--text-m-sm`, `--color-inverse-a60` |
| 进度数值 | | `--text-m-sm-bold`, `--color-accent-orange-6` |
| 进度条容器 | 6px 高 | `--color-inverse-a20` |
| 进度条填充 | | `--gradient-progress` |
| 任务列表区 | 背景 | `--color-surface-canvas` |
| 任务列表间距 | | `--space-lg` (16px) |
| 任务列表内边距 | | `--space-lg` (16px) |
| 任务卡片 | | `--color-fill-1`, `--color-border-default`, `--radius-card` (8px) |
| 任务卡片内边距 | | 16px（Nova 容器 padding） |
| 任务卡片阴影 | | `--shadow-card` |
| 任务名称 | | `--text-m-h2-bold` 16px/700, `--color-text-1` |
| 任务描述 | | `--text-m-sm` 13px/400, `--color-text-4` |
| 操作按钮（未完成） | 79×34px | `--color-primary-6` 背景, `--color-text-7`, `--radius-btn` (6px) |
| 操作按钮（已完成） | 79×34px | `--color-fill-3` 背景, `--color-border-default` 边框, `--color-text-4`, `--radius-btn` (6px) |

---

## 2. 组件设计

### 2.1 按钮组件

| 变体 | 背景 | 文字 | 字号/字重 | 圆角 | 高度 |
|------|------|------|-----------|------|------|
| Primary | `--color-primary-6` | `--color-text-7` | 16px/700 | `--radius-btn` (6px) | 44px |
| Accent CTA | `--color-primary-6` | `--color-text-7` | 16px/700 | `--radius-btn` (6px) | 46px |
| Secondary | `--color-fill-3` | `--color-text-1` | 14px/400 | `--radius-btn` (6px) | 36px |
| Task Active | `--color-primary-6` | `--color-text-7` | 13px/400 | `--radius-btn` (6px) | 34px |
| Task Completed | `--color-fill-3` + `--color-border-default` | `--color-text-4` | 13px/400 | `--radius-btn` (6px) | 34px |
| Disabled | `--color-fill-3-disabled` | `--color-text-6` | 14px/400 | `--radius-btn` (6px) | 34px |

### 2.2 任务卡片组件

| 属性 | 值 |
|------|-----|
| 背景 | `--color-fill-1` |
| 边框 | 1px solid `--color-border-default` |
| 圆角 | `--radius-card` (8px) |
| 阴影 | `--shadow-card` |
| 内边距 | 16px（Nova 容器 padding） |
| 任务名称 | `--text-m-h2-bold`, `--color-text-1` |
| 任务描述 | `--text-m-sm`, `--color-text-4` |
| 标题与描述间距 | `--space-xs` (4px) |

**状态矩阵**

| 状态 | 卡片样式 | 按钮样式 | 按钮文案 |
|------|---------|---------|---------|
| 未完成 | 默认 | Task Active (`--color-primary-6`) | 去绑定/去添加/去填写 |
| 已完成 | 默认 | Task Completed (`--color-fill-3`) | 已完成/已添加/已填写 |
| 全部完成后 | opacity: 0.5（Nova disabled） | Disabled | — |
| 加载中 | 默认 | 按钮显示 loading spinner，不可点击 | — |

### 2.3 进度条组件

| 属性 | Token / 值 |
|------|-----------|
| 容器高度 | 6px |
| 容器背景 | `--color-inverse-a20` |
| 容器圆角 | `--radius-xs` |
| 填充渐变 | `--gradient-progress` |
| 动画 | width 0.3s ease |

### 2.4 弹窗组件

| 属性 | Token / 值 |
|------|-----------|
| 宽度 | 300px |
| 背景 | `--color-fill-1` |
| 圆角 | `--radius-card` (8px) |
| 阴影 | `--shadow-modal` |
| 遮罩 | `--color-overlay` (80%) |
| 头部渐变 | `--gradient-accent-full` |
| 标题 | `--text-m-h1`, `--color-text-1` |
| 关闭按钮 | 28px 圆形, `--color-overlay-a40` |
| 弹出动画 | 淡入 + 缩放 0.95→1.0, 200ms, ease-out（Nova 标准） |
| 关闭动画 | 淡出 + 缩放 1.0→0.95, 150ms, ease-in（Nova 标准） |

### 2.5 悬浮入口组件

| 属性 | Token / 值 |
|------|-----------|
| 高度 | 45px |
| 背景 | #FFFBF0 |
| 底部边框 | 0.5px solid #F0E6CC |
| 文字 | `--text-m-body`, `--color-text-1` |
| 关闭按钮 | 18px, `--color-text-4` |

---

## 3. 交互设计

### 3.1 页面流程

```
首页
 ├─ 弹窗弹出（有未完成任务 + 本次会话未关闭过）
 │   ├─ 点击"去完成" → 新手任务页
 │   └─ 点击关闭 → 弹窗收起，显示悬浮入口
 │
 ├─ 悬浮入口
 │   ├─ 点击 → 新手任务页
 │   └─ 点击关闭 → 隐藏入口
 │
新手任务页
 ├─ 查看任务列表和进度
 ├─ 点击"去XX" → 跳转对应操作页
 ├─ 操作完成 → 自动更新状态和进度
 ├─ 全部完成 → 显示完成弹窗
 └─ 点击返回 → 回到首页
```

### 3.2 交互动效

| 场景 | 动效 | 时长 | 缓动 |
|------|------|------|------|
| 弹窗出现 | 淡入 + 缩放 0.95→1.0 | 200ms | ease-out |
| 弹窗关闭 | 淡出 + 缩放 1.0→0.95 | 150ms | ease-in |
| 页面切换 | 左右滑动 | 300ms | ease-in-out |
| 进度条变化 | 宽度过渡 | 300ms | ease |
| 按钮按下 | 缩放 0.96 + 透明度 0.8 | 150ms | ease |
| 任务完成 | 按钮颜色渐变 + 进度条增长 | 300ms | ease |
| Hover 颜色变化 | 背景色/边框色 | 100ms | ease（Nova 标准） |

---

## 4. 状态设计

### 4.1 加载态

| 场景 | 设计 |
|------|------|
| 任务列表首次加载（> 500ms） | 3 个任务卡片骨架屏占位（灰色矩形闪烁） |
| 任务操作按钮 loading | 按钮内显示 loading spinner（16px），文字隐藏，按钮不可点击 |
| 二维码图片加载中 | 弹窗内 160×160px 灰色占位 + 居中 spinner |

### 4.2 错误态

| 场景 | 设计 |
|------|------|
| 任务列表加载失败 | 列表区显示"加载失败" + "点击重试"按钮，居中展示 |
| 任务完成操作失败 | Toast 提示"操作失败，请检查网络后重试"，按钮恢复为可点击状态 |
| 二维码加载失败 | 弹窗内占位区显示"加载失败，点击重试"文字 |
| 企微回调超时（60s） | 二维码弹窗下方显示"添加超时，请重试" + "我已添加"手动确认按钮 |

### 4.3 扫码等待态

| 场景 | 设计 |
|------|------|
| 用户已扫码，等待企微回调 | 二维码下方显示"等待添加确认中..." + 动态 spinner |
| 回调成功 | spinner 切换为对勾图标（✓），0.5s 后自动关闭弹窗 |

---

## 5. 响应式设计

| 设备 | 宽度 | 布局 |
|------|------|------|
| 手机设计稿 | 750px（2 倍图） | 设计基准，px2rem 自动转换 |
| 手机实际渲染 | 375px | 单列全宽 |
| 平板 | 768px+ | 居中显示 |
| PC | 1050px max-width | 居中布局 |

---

## 6. 关键设计决策

| 决策 | 说明 |
|------|------|
| 品牌主色 | 生财绿 `--color-primary-6` 用于主按钮、链接、选中态 |
| CTA 用主色 | 引导性 CTA 按钮使用 `--color-primary-6` 品牌绿色，与整体视觉一致 |
| 任务按钮用主色 | 任务操作按钮使用 `--color-primary-6` 品牌主色，保持视觉一致性 |
| 深色头部 | 任务页头部使用 `--gradient-dark-header` 深色渐变，营造沉浸感 |
| 进度条用橙色 | 进度反馈使用 `--gradient-progress` 橙色渐变，视觉醒目 |
| Nova 圆角统一 | 按钮 `--radius-btn` (6px)，卡片/弹窗 `--radius-card` (8px) |
| Nova 遮罩统一 | 弹窗遮罩 `--color-overlay` (80% 黑色)，比旧 50% 更强的焦点聚焦 |

---

## 变更记录

| 日期 | 版本 | 变更内容 |
|------|------|---------|
| 2026-02-27 | v1.0 | 初始版本 |
| 2026-02-28 | v1.1 | Nova 规范对齐：圆角统一（弹窗/卡片→radius-card 8px，按钮→radius-btn 6px）、遮罩→overlay 80%、边框→border-default、间距修正（卡片 padding 16px，列表 gap 16px）、动画参数对齐（弹窗 200ms/0.95、hover 100ms）、disabled opacity 0.5；补充加载态/错误态/扫码等待态；修正"绑定星球账号"任务描述 |
