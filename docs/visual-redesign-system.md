# bingbing’s tarot 视觉设计系统

> 状态：视觉重构第二阶段 / 规范冻结稿  
> 视觉基准：本阶段提供的两张桌面效果图。本文把效果图中的共同设计语言转换为可直接落地的 CSS token、布局规则与组件约束；不定义新业务流程，也不要求本阶段改动页面。

## 1. 设计判断与执行原则

本项目的核心不是“深色主题 + 金色按钮”，而是**黑色博物馆展墙与古董纸质藏品之间的材质对照**。黑色区域承载天文学、导航、留白与仪式感；纸张区域承载信息、叙事和可阅读性；塔罗牌是视觉主角，不应被普通 UI 卡片包裹或削弱。

五条执行原则：

1. **编辑排版先于容器**：标题、分栏、编号、细线和留白建立层级，不能依赖一组等宽等高的圆角卡片。
2. **黑与纸是两种表面**：深色表面使用象牙白文字和细金线；纸面使用褐黑墨色，禁止直接套用深色表面的文字 token。
3. **金色只负责聚焦**：用于主 CTA、当前状态、星体节点和少量高亮，单屏金色实心面积原则上不超过可视面积的 6%。
4. **不完美必须受控**：纸边、轻微倾斜、错层都要使用预设档位；不能对每个模块随机变形。
5. **装饰不承担语义**：星轨、噪点、印章和磨损层默认 `aria-hidden="true"`，信息在移除装饰后仍须完整。

明确禁止：玻璃拟态、霓虹/彩虹渐变、彩色状态块、后台式数据面板、到处使用胶囊标签、12–24px 的常规圆角卡片、所有区块等宽等高，以及用普通三列卡片替代参考图里的编辑式拼贴。

---

## 2. 全局 Design Tokens

下一阶段建议把下列 token 放入独立的 `src/styles/tokens.css`，再由 `src/index.css` 导入。旧的 `--app-*` 可短期映射到新 token，页面不再新增 `--app-*`。

```css
:root {
  /* Neutral / celestial surface */
  --color-void-950: #080908;
  --color-void-900: #0d0e0c;
  --color-void-850: #12130f;
  --color-void-800: #181812;

  /* Paper */
  --color-ivory-100: #f6efdf;
  --color-ivory-200: #eee4d1;
  --color-paper-300: #e4d3b5;
  --color-paper-400: #ceb990;

  /* Ink */
  --color-ink-900: #201c15;
  --color-ink-700: #51483a;
  --color-ink-500: #786e5d;

  /* Restrained gold */
  --color-gold-500: #d5a91e;
  --color-gold-400: #e5bb28;
  --color-gold-300: #f1c62b;
  --color-gold-700: #927019;

  /* Semantic text */
  --text-on-dark: var(--color-ivory-100);
  --text-on-dark-muted: rgba(238, 228, 209, 0.62);
  --text-on-paper: var(--color-ink-900);
  --text-on-paper-muted: var(--color-ink-500);
  --text-accent: var(--color-gold-400);

  /* Semantic lines and surfaces */
  --surface-canvas: var(--color-void-900);
  --surface-canvas-raised: var(--color-void-850);
  --surface-paper: var(--color-ivory-200);
  --surface-paper-bright: var(--color-ivory-100);
  --line-on-dark: rgba(213, 169, 30, 0.24);
  --line-on-dark-strong: rgba(229, 187, 40, 0.52);
  --line-on-paper: rgba(63, 49, 27, 0.22);
  --line-on-paper-soft: rgba(63, 49, 27, 0.12);

  /* State colors stay within the material palette */
  --state-focus: var(--color-gold-300);
  --state-disabled: rgba(120, 110, 93, 0.38);
  --state-danger: #8a4435;
}
```

### 2.1 使用比例

- 页面底色：`--color-void-900` 占 55–75%。
- 纸张：每屏形成 1–3 个较大的非等距块面，避免切成大量小面板。
- 象牙白：主要用于标题和纸张高光，不使用纯白 `#fff`。
- 金色：优先以 1px 线、8px 内节点、图标和文字状态出现；大面积实心金只给唯一主 CTA 或太阳/月相主体。
- 禁止用透明白面板覆盖黑底；深色层次通过相邻黑阶、线框和留白表达。

---

## 3. 字体与字号层级

### 3.1 字体方案

字体文件应在下一阶段以 WOFF2 自托管到 `public/fonts/`，避免不同操作系统产生明显偏差。中文和拉丁字符通过字体缺字回退自然混排。

```css
:root {
  --font-display:
    "Cormorant Garamond", "Bodoni 72", Didot,
    "Noto Serif SC", "Source Han Serif SC", "Songti SC", STSong, serif;
  --font-reading:
    "Source Serif 4", "Noto Serif SC", "Source Han Serif SC",
    "Songti SC", STSong, Georgia, serif;
  --font-ui:
    "Inter", "Noto Sans SC", "Source Han Sans SC", "PingFang SC",
    "Microsoft YaHei", system-ui, sans-serif;
}
```

- **展示标题**：拉丁 `Cormorant Garamond` 500；中文 `Noto Serif SC` 600。使用高对比衬线，不使用仿书法字体。
- **长文阅读**：`Source Serif 4` / `Noto Serif SC` 400–500；纸面正文统一衬线。
- **导航、按钮、标签、时间和坐标**：`Inter` / `Noto Sans SC` 400–600；小字号需要无衬线确保清楚。
- 数字、罗马数字和英文大标题使用 `font-variant-numeric: lining-nums tabular-nums`；品牌名与英文大标题允许 `font-variant-ligatures: common-ligatures`。

### 3.2 字号 token

```css
:root {
  --type-display-xl: clamp(4.5rem, 7.4vw, 8.5rem); /* 首页主标，72–136 */
  --type-display-lg: clamp(3.5rem, 5.5vw, 6rem);   /* 详情页中英标题，56–96 */
  --type-display-md: clamp(2.5rem, 4vw, 4.5rem);   /* 分区标题，40–72 */
  --type-heading-lg: clamp(2rem, 2.8vw, 3.25rem);  /* 32–52 */
  --type-heading-md: clamp(1.5rem, 2vw, 2rem);     /* 24–32 */
  --type-heading-sm: 1.25rem;                      /* 20 */
  --type-body-lg: 1.125rem;                        /* 18 */
  --type-body-md: 1rem;                            /* 16 */
  --type-body-sm: 0.875rem;                        /* 14 */
  --type-caption: 0.75rem;                         /* 12 */
  --type-micro: 0.6875rem;                         /* 11 */
}
```

### 3.3 排版规则

| 用途 | 字体/字重 | 行高 | 字距 | 限制 |
| --- | --- | --- | --- | --- |
| 首页主标题 | display 500 | 0.88–0.94 | 英文 `-0.035em`，中文 `-0.02em` | 桌面每行 8–18 个英文字符；移动端不得小于 48px |
| 页面主标题 | display 500/600 | 0.96–1.05 | `-0.02em` | 中英可同排，英文基线下沉不超过 `0.06em` |
| 分区标题 | display 500/600 | 1.05–1.2 | `-0.01em` | 不强制全大写 |
| 正文 | reading 400 | 1.75 中文 / 1.65 英文 | 中文 `0.015em` | 单行 28–38 个中文字符或 55–72 个拉丁字符 |
| 导航/按钮 | ui 500 | 1 | 中文 `0.06em`，英文 `0.1em` | 英文可大写，小字号不使用细字重 |
| Eyebrow/坐标 | ui 500 | 1.4 | 英文 `0.18em`，中文 `0.08em` | 11–12px，仅作辅助信息 |

文本强调不使用彩色背景块堆叠。纸面重点可用 `linear-gradient(transparent 58%, rgba(229,187,40,.48) 58%)` 做单行手工划线；同一段最多一处。

---

## 4. 页面宽度、栅格与间距

```css
:root {
  --page-max: 1600px;
  --content-max: 1440px;
  --reading-max: 1120px;
  --prose-max: 720px;
  --page-gutter: clamp(20px, 3vw, 48px);

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;
  --space-16: 64px;
  --space-24: 96px;
  --space-32: 128px;
}
```

- **桌面 ≥ 1200px**：12 列，列间距 24px；容器最大 1600px。主内容不默认居中成窄卡片，应允许 4/8、5/7、7/5 等不对称跨列。
- **平板 768–1199px**：6 列，列间距 20px；复杂双栏按阅读顺序重排。
- **移动 < 768px**：4 列，列间距 16px；左右边距 20px（最窄屏 16px）。纸张可超出栅格 4–8px 形成自然错层，但可交互内容不能溢出。
- 全屏章节的垂直留白：桌面 96–128px，平板 72–96px，移动 56–72px。
- 同一语义组内使用 8/12/16px；组与组之间 24/32px；章节间 64px 以上。
- 参考图中的“非等宽”是系统规则：连续三个内容块建议使用 5/4/3、4/4/4 中加入视觉错位，或 4/5/3；不能为对齐方便统一高度。

建议布局原语：`.ds-container`、`.ds-grid`、`.ds-prose`、`.ds-section`。页面只决定跨列数和排列顺序，不重复定义最大宽度。

---

## 5. 边框、阴影、按钮与标签

### 5.1 边框与圆角

```css
:root {
  --border-hairline: 1px;
  --radius-none: 0;
  --radius-paper: 2px;
  --radius-control: 3px;
  --radius-pill: 999px; /* 只用于主 CTA、筛选胶囊和圆形图标按钮 */
}
```

- 黑底分隔线：`1px solid var(--line-on-dark)`；不要使用发光边框。
- 纸面分隔线：`1px solid var(--line-on-paper-soft)`；外轮廓可用 `--line-on-paper`。
- 内容卡片默认 0–3px 圆角。纸张的不规则外形来自遮罩或素材，不来自 24px 圆角。
- 相邻纸页允许边缘交叠 8–18px，交叠处必须有接触阴影。

### 5.2 阴影

```css
:root {
  --shadow-paper-rest:
    0 1px 0 rgba(255,255,255,.28) inset,
    0 2px 3px rgba(0,0,0,.20),
    0 18px 42px rgba(0,0,0,.24);
  --shadow-paper-lift:
    0 2px 0 rgba(255,255,255,.30) inset,
    0 8px 14px rgba(0,0,0,.24),
    0 28px 56px rgba(0,0,0,.32);
  --shadow-tarot-rest: 0 5px 8px rgba(0,0,0,.28), 0 28px 54px rgba(0,0,0,.34);
  --shadow-tarot-hover: 0 10px 14px rgba(0,0,0,.30), 0 40px 72px rgba(0,0,0,.42);
}
```

阴影保持中性黑褐色，不加金色 glow。只有直径 4–10px 的星体节点允许 `0 0 12px rgba(241,198,43,.45)`。

### 5.3 按钮

按钮高度桌面 44–52px、触控端不小于 48px；焦点可见范围不小于 2px。

| 类型 | 视觉 | 使用规则 |
| --- | --- | --- |
| Primary / Solar | 金色实心，褐黑文字，胶囊或轻微不规则 3px 边缘 | 每个视觉章节最多 1 个；禁用渐变和外发光 |
| Secondary / Outline | 透明底、象牙白或墨色文字、1px 对应表面边框 | 用于“了解/返回/查看”等次动作；可为长胶囊，但不强制所有按钮胶囊化 |
| Tertiary / Text | 无容器，文字 + 16px 箭头，底部细线在 hover 展开 | 列表尾部、导航和附属动作 |
| Icon | 40–44px 圆形，1px 细线 | 只用于明确图标动作；必须有 `aria-label` |

状态：hover 只提升明度或位移 1–2px；active 回落 1px；disabled 降至 38% 且取消阴影；`:focus-visible` 使用 `2px solid --state-focus`，`outline-offset: 3px`。

### 5.4 标签与状态

- 关键词标签：透明底 + 1px 金褐线，2px 圆角，水平 10px / 垂直 4px；14px 字号；换行时保持自然宽度。
- 当前状态：允许金色文字/下划线/节点三选一，不同时使用实心底、描边和发光。
- 编号：`01`、`XVIII` 作为排版元素而非 badge；用衬线 24–36px，背景透明。
- 数量 badge 仅用于未读等必要场景，直径 16–20px，禁止将所有元数据做成小胶囊。

---

## 6. 黑色天文背景系统

天文装饰分为四层，DOM 中按层级组合，不把整屏焊死成一张背景图。

1. **底色层**：`#0d0e0c` 到 `#12130f` 的极弱径向明暗，明度差不超过 4%。
2. **噪点层**：单色颗粒，`mix-blend-mode: soft-light`，整体不透明度 6–10%，固定覆盖视口；颗粒尺寸 120–240px 平铺，不能形成可辨识重复。
3. **星图层**：0.5–1px 金褐轨道线，10–28% 不透明度；椭圆轨道、坐标十字、刻度、星点组成，每个主视觉组最多 3–5 条轨道。
4. **焦点层**：太阳/月相/八芒星等 1 个主天体 + 2–6 个节点。实心金主体可占对应装饰组的 15–35%，其余保持线稿。

具体约束：

- 星点尺寸限定 1px、2px、4px、8px 四档；8px 只作当前节点。
- 轨道使用 `stroke-dasharray: 2 5` 或连续 1px 线，禁止霓虹模糊线。
- 天文标注使用 11–12px UI 字体、`0.12em` 字距、45–65% 象牙白；与内容保持至少 24px 安全距。
- 装饰密度：主视觉区可以较高，正文阅读区后方必须降低至不透明度 8% 以下。
- 背景装饰不响应指针；小屏隐藏外围坐标文本，保留 1–2 条主轨道，不能把桌面星图等比缩成噪声。

推荐实现：轨道、刻度、星芒用可复用 SVG symbol；底色与局部光晕用 CSS gradient；噪点用一张无缝 WebP/PNG。不要用数十个绝对定位 `div` 手画每颗星。

---

## 7. 纸张、羊皮纸与叠层规则

### 7.1 纸面构成

一张标准纸面由以下层叠组成：

```css
.paper-surface {
  color: var(--text-on-paper);
  background-color: var(--surface-paper);
  background-image:
    linear-gradient(115deg, rgba(255,255,255,.22), transparent 34%),
    linear-gradient(8deg, rgba(98,72,35,.06), transparent 42%),
    var(--texture-paper-fibers);
  border: 1px solid var(--line-on-paper);
  border-radius: var(--radius-paper);
  box-shadow: var(--shadow-paper-rest);
}
```

- 底纹使用真实纸纤维素材，显示强度 10–18%；不能只用米色纯色或高频 CSS noise 假装纸张。
- 污渍集中在边缘，中心正文区对比度必须稳定；任何污渍不得穿过两行以上正文。
- 每张纸最多一个明显折角或缺口。磨损不等于四边均匀烧焦，禁止深褐色粗描边。
- 旧纸亮度分三档：亮纸用于主阅读，旧纸用于次级内容，黑纸用于反相功能区；同屏至少有两个材质层次。

### 7.2 边缘预设

建立 3 个固定 SVG mask，而不是运行时随机：

- `paper-edge-soft`：轻微波动 1–3px，适合正文纸页。
- `paper-edge-worn`：局部缺口 3–8px，适合首页功能纸片。
- `paper-edge-torn`：单侧撕裂 6–14px，只用于章节转折或最上层便笺。

移动端的缺口最大值减半，保证触控区和文字不被遮挡。所有 mask 预留 12px 安全内边距。

### 7.3 叠层卡片

- 两层纸：后层 `translate(8px, 8px) rotate(.35deg)`；三层时第三层反向 `rotate(-.45deg)`。
- 内容层默认 `rotate(0)`；仅展示型纸片允许 `-0.6deg`、`0.35deg`、`0.7deg` 三个固定倾角。
- 叠层 z 轴间距通过 6–14px 位移和接触阴影表达，禁止用大范围 blur 做玻璃悬浮。
- 一组叠纸共享一个语义容器；装饰伪元素不可进入键盘焦点顺序。

---

## 8. 塔罗牌视觉规则

韦特牌图片的原始宽高比约为 **2:3**。展示时必须使用 `aspect-ratio: 2 / 3; object-fit: cover`，不拉伸、不裁掉牌名和编号；若具体图片边缘比例不一致，先在素材处理阶段加统一内框，不在页面逐张补偿。

| 场景 | 宽度 | 边框 | 倾斜 |
| --- | ---: | --- | --- |
| Hero 主牌 | `clamp(260px, 24vw, 390px)` | 外 2px 旧纸色 + 内 1px 墨线 | `-5deg` 至 `5deg`，每个构图固定 |
| 详情页主牌 | `clamp(240px, 28vw, 360px)` | 同上 | `-1deg` 至 `1deg` |
| 牌阵标准牌 | 144–184px | 1px 旧纸 + 内线 | 单张不倾斜；扇形按位置 ±4–9deg |
| 预览牌 | 72–112px | 1px | ±1.5deg |
| 时间线缩略牌 | 40–56px | 1px | 0deg |

- 图片容器圆角 2–5px，只模拟旧牌边缘；当前 `1.6rem` 大圆角不属于目标系统。
- 默认阴影使用 `--shadow-tarot-rest`；牌与背景的最小明度差通过旧纸外框保证。
- 正位/逆位只旋转图片内部 180°，外部阴影、标签和 hover 坐标系保持正向。
- 牌背与牌面使用同一几何尺寸；翻牌时设置 `backface-visibility: hidden`，禁止翻转过程中改变宽高。
- 图片建议生成 320、640、960px 三档 WebP/AVIF，并保留 JPEG 回退；Hero 使用 `sizes`，避免加载所有原图。

Hover（仅 `@media (hover: hover)`）：

- 主牌：`translateY(-8px) rotate(calc(var(--card-tilt) + .6deg)) scale(1.012)`。
- 牌阵：`translateY(-6px) scale(1.025)`，不改扇形的基础旋转方向。
- 180–240ms，`cubic-bezier(.22,.8,.2,1)`；阴影切到 `--shadow-tarot-hover`。
- 触控端无 hover 位移；选中态使用金色底部细线或角标，不靠持续放大。

---

## 9. 共用组件视觉规则

### 9.1 导航栏 `SiteHeader`

- 桌面高度 72px，最大宽 1600px；底部 1px 金褐线，不用悬浮玻璃层。
- 品牌左对齐，主导航保持充足间隔；语言、通知、兑换、余额作为右侧工具组。
- 当前页用金色文字 + 下方 4px 节点（二选一也可），不要使用实心 tab。
- 小屏折叠业务导航；品牌、语言和一个菜单入口保留。工具项进入菜单，不做横向滚动的一排小胶囊。
- 首页 `.topbar` 与内页 `.page-header` 应收敛为同一组件的 `home | inner` 变体。

### 9.2 标题组件 `EditorialHeading`

- 由 eyebrow、主标题、可选中英副标题、编号/罗马数字和 40–96px 细线组成。
- 大标题允许跨越多列或与塔罗牌错位重叠，但文字不可盖住牌面主体。
- 中文与英文同排时以中文为第一视觉锚点；英文 78–90% 字号，避免机械地用竖线分隔。

### 9.3 正文 `Prose`

- 纸面正文最大 720px；18px/1.75 为首选，移动端 16px/1.75。
- 段间距 0.8em，列表缩进 1.25em；小标题前距 1.8em、后距 0.45em。
- 一段不超过约 6 行桌面文字；长解释拆成有标题的纸页或章节，不拆成 SaaS 卡片。

### 9.4 卡片/纸页 `PaperPanel`

- 变体：`bright`（主阅读）、`aged`（辅助）、`ink`（黑纸）、`note`（短便笺）。
- 内边距：桌面 32–48px，移动 20–24px。
- 默认不设置固定高度；同行模块可基线对齐，但内容决定高度。
- 图标只作 16–24px 的章节记号，优先太阳、月亮、八芒星、眼睛和方向箭头的统一线稿集。

### 9.5 时间线 `ArchiveTimeline`

- 纵线 1px `--line-on-dark-strong`；节点 8px 空心圆，当前节点为 8px 实心金 + 最多 12px 微弱光晕。
- 主时间线文字位于线的一侧，缩略牌/时间可交错在另一侧；行距 64–88px，禁止压成后台日志表。
- 日期使用 12px UI 字体、次要色；牌名使用 16px 衬线；正/逆位为普通文字，不做彩色徽章。
- 移动端统一放到线右侧，缩略牌 44px，隐藏非必要摘要；保留阅读顺序。

### 9.6 共享控件

- `LanguageSwitcher`：桌面使用 `中文 / EN / IT` 的纯文字分隔，当前项金色并带细下划线；不使用分段控制器背景。
- `CardStyleToggle`：可保留为细线分段控件，但仅在确有两种视觉模式时出现；高度 36–40px，2px 圆角。
- `Modal`：遮罩为 `rgba(4,4,3,.82)`，允许 2–4px 轻微背景模糊；主体必须表现为纸页或黑色展板，不是居中白色圆角框。
- 表单：纸面输入框为透明/半透明纸色 + 1px 墨线，3px 圆角；深色输入区为黑色底 + 金褐线。placeholder 对比度不低于 4.5:1。

---

## 10. 动效系统

### 10.1 时间与缓动

```css
:root {
  --ease-out-editorial: cubic-bezier(.22, .8, .2, 1);
  --ease-in-out-orbit: cubic-bezier(.65, 0, .35, 1);
  --duration-fast: 160ms;
  --duration-base: 220ms;
  --duration-enter: 520ms;
  --duration-slow: 900ms;
}
```

- Hover/按压：160–220ms。
- 普通进入：420–560ms，`opacity 0→1` + `translateY(16px→0)`。
- Hero 标题：按行 stagger 60–90ms，总时长不超过 900ms。
- 纸页进入：透明度 + 12px 位移 + 最多 0.4deg 回正；不使用弹簧抖动。
- 塔罗翻牌：600–760ms，单次 `rotateY(180deg)`；翻完后静止。
- 轨道自转：45–90s 一圈、线性、低对比；同屏最多两组持续运动。

### 10.2 滚动动画

- 使用 `IntersectionObserver` 或现有 Framer Motion `whileInView`，阈值 0.15，`once: true`。
- 相邻纸页 stagger 60ms，最多 4 项；长列表不逐项动画。
- 轻视差只在桌面启用，范围 4–12px；牌面和正文不做滚动模糊、缩放或横向漂移。
- 页面切换优先淡入/短位移，不做全屏转场遮罩。

### 10.3 Reduced motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  [data-parallax], .orbit-motion { transform: none !important; }
}
```

组件逻辑也必须读取 reduced-motion：Framer Motion 的进入状态直接设为最终状态；翻牌以 120ms crossfade 替代 3D 旋转；自动轨道完全停止。不能只靠全局 CSS 缩短动画，因为 JS 驱动动画仍可能运行。

---

## 11. CSS、SVG 与图片素材的边界

| 效果 | 实现方式 | 说明 |
| --- | --- | --- |
| 黑色底色、弱径向明暗 | 纯 CSS | 2 层以内 gradient，避免多层彩色渐变 |
| 页面栅格、细线、间距、排版 | 纯 CSS | 使用本文 token 和 Grid |
| 按钮、标签、focus、基础 hover | 纯 CSS | 不用位图 |
| 简单星点、小光晕、圆形主天体 | 纯 CSS | 星点数量少时使用伪元素 |
| 椭圆轨道、刻度、星座连线、八芒星、月相、眼睛符号 | SVG sprite | `currentColor`，线宽统一；方便响应式裁切和动画 |
| 全屏单色噪点 | 无缝 WebP/PNG | 一张 256–512px 小纹理；CSS data-URI 只作临时占位 |
| 真实纸纤维、局部污渍 | WebP/PNG 纹理 | 需要真实摄影/扫描质感，至少亮纸与旧纸两档 |
| 纸张磨损/撕裂边缘 | SVG mask + 少量透明 PNG | 三个固定 mask；复杂纤维毛边可用透明位图 |
| 折角与接触阴影 | CSS + 可选 SVG mask | 简单折角用伪元素，复杂破损用素材 |
| 塔罗牌本体 | AVIF/WebP/JPEG 图片 | 保留现有牌图，后续统一色温、边框和响应式规格 |
| 黄线高亮、印刷错位 | 纯 CSS | 强度克制，不对每段使用 |
| 印章、天文版画插图 | SVG 或透明 WebP | 作为低对比装饰，不用 emoji/Unicode 替代正式图标 |

需要补充的素材清单：

1. `noise-mono.webp`：无缝单色颗粒。
2. `paper-fiber-light.webp`、`paper-fiber-aged.webp`：两档纸纤维。
3. `paper-stain-edge-01.webp`：透明背景局部边缘污渍。
4. `paper-edge-soft.svg`、`paper-edge-worn.svg`、`paper-edge-torn.svg`：固定遮罩。
5. `celestial-symbols.svg`：太阳、月亮、八芒星、眼睛、轨道节点的 sprite。
6. 自托管字体 WOFF2：展示、阅读、UI 三组及其许可证文件。

---

## 12. 响应式与可访问性底线

- 文字/底色对比度：正文至少 4.5:1，大字至少 3:1；金色小字不得直接放在旧纸色上。
- 所有交互目标至少 44×44px，移动端首选 48px。
- `:focus-visible` 不得被纸边遮罩裁切；mask 容器内的按钮需额外 4px 安全区。
- 200% 缩放下不横向溢出；语言切换到英文/意大利文后按钮不截字。
- 移动端首先保留主标题、主 CTA、主牌和正文；星图标注、外围轨道、叠纸后层可逐级减少。
- 任何仅在 hover 出现的信息必须同时能通过 focus 或点击获得。
- 装饰 SVG 使用 `focusable="false" aria-hidden="true"`；有语义的图标必须有可访问名称。

---

## 13. 下一阶段优先修改清单

### P0：全局样式入口与基础组件

1. **`src/index.css`**：保留 reset、基础可访问性和旧样式过渡映射；逐步拆出 token、排版、布局和组件层。当前文件约 42KB，不能继续作为所有页面样式的唯一落点。
2. **`src/solar.css`**：停止作为覆盖 `index.css` 的第二套全局主题；将已验证的黑/纸/金方向拆入正式模块后删除重复 token。当前同样约 42KB，且再次定义 `:root`。
3. **`src/main.jsx`**：调整为单一样式入口，顺序建议为 `tokens → fonts → base → primitives → components → utilities`。
4. **`tailwind.config.js`**：把颜色、字体、间距、阴影映射到同一 token；限制任意值继续扩散。Tailwind 仅作布局/小工具，材质与复杂组件使用语义类。
5. **`src/TarotCard.jsx`**：移除大圆角、任意值阴影和尺寸字符串，收敛为 `hero | detail | spread | preview | timeline` 规格；保留现有正逆位逻辑。
6. **`src/components/LanguageSwitcher.tsx`**：改成无底板文字导航式视觉，并补齐当前项语义（建议 `aria-current`）。
7. **`src/components/CardStyleToggle.jsx`**：统一高度、边框、focus 与 active token。
8. **`src/components/SpreadCards.jsx`**：统一牌间距、扇形倾角、元数据排版和移动端重排。

### P1：建议新增的共享视觉层（先建组件，再迁页面）

- `src/styles/tokens.css`
- `src/styles/fonts.css`
- `src/styles/base.css`
- `src/styles/primitives.css`
- `src/styles/motion.css`
- `src/components/layout/SiteHeader.jsx`
- `src/components/ui/EditorialHeading.jsx`
- `src/components/ui/PaperPanel.jsx`
- `src/components/ui/Button.jsx`
- `src/components/ui/CelestialBackdrop.jsx`
- `src/components/ui/ArchiveTimeline.jsx`

### P2：共享弹层与页面接入

待 P0/P1 稳定后，再统一 `src/components/modals/*.jsx` 的纸页结构、遮罩、关闭按钮与动效。随后按“首页 → 抽牌 → 结果 → 牌意列表/详情 → 对话/消息 → 登录”的顺序接入；每次只替换视觉结构，不改抽牌、登录、Supabase 或国际化逻辑。

## 14. 下一阶段验收标准

- token 中不存在互相竞争的两套黑/纸/金主题值。
- 任一页面在关闭纹理素材后仍保留正确层级，开启纹理后没有影响正文可读性。
- 组件不再依赖 12px 以上圆角来表达分组。
- 首页和详情页至少形成一种明确的不对称编辑栅格，而不是等宽卡片阵列。
- 塔罗牌在所有规格下保持约 2:3、不裁切牌名，正逆位逻辑正确。
- 键盘焦点、200% 缩放、三语言文本与 reduced-motion 均通过检查。
- 页面业务逻辑与数据接口无改动。

