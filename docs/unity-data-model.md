# 万象归一阵数据模型 / The Unity of All Things Data Model

## 文档目的与边界

本文定义一次“万象归一阵”阅读的持久化数据契约。它是未来前端、服务端、解读引擎与历史记录共用的事实来源，不包含 React、TypeScript、数据库表、接口或 UI 实现。

固定原则：六爻为主、塔罗为辅；每轮三张塔罗牌只负责生成并补充对应的一爻。爻位一律使用 **自下而上、从初爻到上爻** 的 1–6 编号。

---

# 1. 单次阅读 JSON 结构

以下是一个已完成阅读的完整示例。示例中的牌名、卦名和解释仅用于说明字段结构，不构成牌义或卦义内容。

```json
{
  "schemaVersion": "1.0",
  "id": "unity-reading_01JY8Y7Q4R7K5M3N9P2A6B8C1D",
  "status": "completed",
  "spread": {
    "key": "unity-of-all-things",
    "name": "万象归一阵",
    "englishName": "The Unity of All Things",
    "method": "three-coin-tarot-mapping",
    "roundCount": 6,
    "cardsPerRound": 3,
    "totalCardCount": 18,
    "lineOrder": "bottom-to-top"
  },
  "question": {
    "text": "未来六个月，我应如何调整事业与长期关系的重心？",
    "locale": "zh-CN",
    "timeframe": "未来六个月",
    "submittedAt": "2026-07-16T10:00:00.000+08:00"
  },
  "rounds": [
    {
      "roundIndex": 1,
      "lineIndex": 1,
      "linePosition": "initial",
      "lineLabel": "初爻",
      "tarotCards": [
        {
          "drawIndex": 1,
          "cardId": "major-14",
          "name": "节制",
          "englishName": "Temperance",
          "orientation": "upright",
          "coinValue": 2
        },
        {
          "drawIndex": 2,
          "cardId": "cups-02",
          "name": "圣杯二",
          "englishName": "Two of Cups",
          "orientation": "reversed",
          "coinValue": 3
        },
        {
          "drawIndex": 3,
          "cardId": "wands-03",
          "name": "权杖三",
          "englishName": "Three of Wands",
          "orientation": "upright",
          "coinValue": 2
        }
      ],
      "threeCardValues": [2, 3, 2],
      "lineValue": 7,
      "linePolarity": "yang",
      "lineAge": "young",
      "isMoving": false,
      "changedPolarity": "yang"
    },
    {
      "roundIndex": 2,
      "lineIndex": 2,
      "linePosition": "second",
      "lineLabel": "二爻",
      "tarotCards": [
        {
          "drawIndex": 1,
          "cardId": "pentacles-06",
          "name": "星币六",
          "englishName": "Six of Pentacles",
          "orientation": "upright",
          "coinValue": 2
        },
        {
          "drawIndex": 2,
          "cardId": "swords-08",
          "name": "宝剑八",
          "englishName": "Eight of Swords",
          "orientation": "upright",
          "coinValue": 2
        },
        {
          "drawIndex": 3,
          "cardId": "major-18",
          "name": "月亮",
          "englishName": "The Moon",
          "orientation": "reversed",
          "coinValue": 3
        }
      ],
      "threeCardValues": [2, 2, 3],
      "lineValue": 7,
      "linePolarity": "yang",
      "lineAge": "young",
      "isMoving": false,
      "changedPolarity": "yang"
    },
    {
      "roundIndex": 3,
      "lineIndex": 3,
      "linePosition": "third",
      "lineLabel": "三爻",
      "tarotCards": [
        {
          "drawIndex": 1,
          "cardId": "major-16",
          "name": "高塔",
          "englishName": "The Tower",
          "orientation": "reversed",
          "coinValue": 3
        },
        {
          "drawIndex": 2,
          "cardId": "swords-05",
          "name": "宝剑五",
          "englishName": "Five of Swords",
          "orientation": "upright",
          "coinValue": 2
        },
        {
          "drawIndex": 3,
          "cardId": "wands-09",
          "name": "权杖九",
          "englishName": "Nine of Wands",
          "orientation": "upright",
          "coinValue": 2
        }
      ],
      "threeCardValues": [3, 2, 2],
      "lineValue": 7,
      "linePolarity": "yang",
      "lineAge": "young",
      "isMoving": false,
      "changedPolarity": "yang"
    },
    {
      "roundIndex": 4,
      "lineIndex": 4,
      "linePosition": "fourth",
      "lineLabel": "四爻",
      "tarotCards": [
        {
          "drawIndex": 1,
          "cardId": "major-02",
          "name": "女祭司",
          "englishName": "The High Priestess",
          "orientation": "upright",
          "coinValue": 2
        },
        {
          "drawIndex": 2,
          "cardId": "cups-07",
          "name": "圣杯七",
          "englishName": "Seven of Cups",
          "orientation": "upright",
          "coinValue": 2
        },
        {
          "drawIndex": 3,
          "cardId": "pentacles-04",
          "name": "星币四",
          "englishName": "Four of Pentacles",
          "orientation": "upright",
          "coinValue": 2
        }
      ],
      "threeCardValues": [2, 2, 2],
      "lineValue": 6,
      "linePolarity": "yin",
      "lineAge": "old",
      "isMoving": true,
      "changedPolarity": "yang"
    },
    {
      "roundIndex": 5,
      "lineIndex": 5,
      "linePosition": "fifth",
      "lineLabel": "五爻",
      "tarotCards": [
        {
          "drawIndex": 1,
          "cardId": "major-04",
          "name": "皇帝",
          "englishName": "The Emperor",
          "orientation": "reversed",
          "coinValue": 3
        },
        {
          "drawIndex": 2,
          "cardId": "wands-06",
          "name": "权杖六",
          "englishName": "Six of Wands",
          "orientation": "reversed",
          "coinValue": 3
        },
        {
          "drawIndex": 3,
          "cardId": "swords-02",
          "name": "宝剑二",
          "englishName": "Two of Swords",
          "orientation": "upright",
          "coinValue": 2
        }
      ],
      "threeCardValues": [3, 3, 2],
      "lineValue": 8,
      "linePolarity": "yin",
      "lineAge": "young",
      "isMoving": false,
      "changedPolarity": "yin"
    },
    {
      "roundIndex": 6,
      "lineIndex": 6,
      "linePosition": "top",
      "lineLabel": "上爻",
      "tarotCards": [
        {
          "drawIndex": 1,
          "cardId": "major-09",
          "name": "隐者",
          "englishName": "The Hermit",
          "orientation": "reversed",
          "coinValue": 3
        },
        {
          "drawIndex": 2,
          "cardId": "cups-08",
          "name": "圣杯八",
          "englishName": "Eight of Cups",
          "orientation": "reversed",
          "coinValue": 3
        },
        {
          "drawIndex": 3,
          "cardId": "pentacles-09",
          "name": "星币九",
          "englishName": "Nine of Pentacles",
          "orientation": "reversed",
          "coinValue": 3
        }
      ],
      "threeCardValues": [3, 3, 3],
      "lineValue": 9,
      "linePolarity": "yang",
      "lineAge": "old",
      "isMoving": true,
      "changedPolarity": "yin"
    }
  ],
  "tarotCards": [
    {
      "globalDrawIndex": 1,
      "roundIndex": 1,
      "lineIndex": 1,
      "drawIndex": 1,
      "cardId": "major-14",
      "orientation": "upright",
      "coinValue": 2
    }
  ],
  "primaryHexagram": {
    "kingWenNumber": 11,
    "name": "泰",
    "englishName": "Peace",
    "lowerTrigram": "乾",
    "upperTrigram": "坤",
    "linePatternBottomToTop": ["yang", "yang", "yang", "yin", "yin", "yang"]
  },
  "changedHexagram": {
    "kingWenNumber": 54,
    "name": "归妹",
    "englishName": "The Marrying Maiden",
    "lowerTrigram": "乾",
    "upperTrigram": "兑",
    "linePatternBottomToTop": ["yang", "yang", "yang", "yang", "yin", "yin"]
  },
  "movingLineIndexes": [4, 6],
  "interpretation": {
    "status": "pending",
    "source": "future-ai-or-editorial",
    "summary": null,
    "lineInterpretations": [],
    "interpretationSnapshot": null,
    "generatedAt": null
  },
  "ai": {
    "status": "not-requested",
    "model": null,
    "promptVersion": null,
    "sourceVersion": null,
    "generatedAt": null,
    "regenerationHistory": []
  },
  "history": {
    "ownerId": null,
    "visibility": "private",
    "archivedAt": null,
    "deletedAt": null,
    "tags": []
  },
  "sharing": {
    "status": "disabled",
    "shareId": null,
    "publicUrl": null,
    "access": "private",
    "expiresAt": null,
    "redactedFields": ["question.text"]
  },
  "timestamps": {
    "createdAt": "2026-07-16T10:00:00.000+08:00",
    "completedAt": "2026-07-16T10:04:30.000+08:00",
    "updatedAt": "2026-07-16T10:04:30.000+08:00"
  }
}
```

> `rounds` 是生成结果的唯一事实来源。`tarotCards` 是方便历史检索、导出和分析的冗余扁平索引；保存时必须与 `rounds[*].tarotCards` 完全一致，不得独立编辑。

---

# 2. 字段定义

## 2.1 顶层字段

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `schemaVersion` | 字符串 | 是 | 数据契约版本。用于未来迁移和兼容读取。 |
| `id` | 字符串 | 是 | 一次阅读的全局唯一 ID；不包含用户问题等可识别内容。 |
| `status` | 枚举 | 是 | 阅读生命周期：`draft`、`in-progress`、`completed`、`cancelled`、`failed`。只有 `completed` 才应包含完整六轮和卦象。 |
| `spread` | 对象 | 是 | 固定牌阵身份及不可变规则元数据。 |
| `question` | 对象 | 是 | 用户在仪式开始时提交的问题与可选时间范围。 |
| `rounds` | 长度为 6 的数组 | 完成时是 | 六次抽取及六爻生成记录，自下而上。 |
| `tarotCards` | 长度为 18 的数组 | 完成时是 | 从 `rounds` 派生出的扁平牌索引，方便按单张牌检索。 |
| `primaryHexagram` | 对象 | 完成时是 | 由六条本卦爻线构成的本卦。 |
| `changedHexagram` | 对象 | 完成时是 | 将所有动爻翻转后的变卦；无动爻时与本卦相同。 |
| `movingLineIndexes` | 整数数组 | 完成时是 | 所有动爻的 1-based 爻位，固定自下而上排序。 |
| `interpretation` | 对象 | 是 | 人工或未来 AI 的可展示解读快照。 |
| `ai` | 对象 | 是 | 未来 AI 的生成溯源、版本与再解读记录。 |
| `history` | 对象 | 是 | 私人历史、归档和软删除预留。 |
| `sharing` | 对象 | 是 | 外部分享、访问级别与脱敏策略预留。 |
| `timestamps` | 对象 | 是 | 创建、完成和最后更新的带时区 ISO 8601 时间。 |

## 2.2 `spread`：牌阵固定信息

`spread` 让历史阅读保留当时采用的规则，即使将来产品新增其他牌阵也不会混淆。

| 字段 | 合法值或格式 | 说明 |
| --- | --- | --- |
| `key` | `unity-of-all-things` | 稳定机器标识，不应依赖显示文案。 |
| `name` / `englishName` | 字符串 | 牌阵的中英文归档名称。 |
| `method` | `three-coin-tarot-mapping` | 表明使用传统三币法的塔罗正逆位映射。 |
| `roundCount` | `6` | 固定六轮，对应六爻。 |
| `cardsPerRound` | `3` | 固定每轮三张牌。 |
| `totalCardCount` | `18` | 固定总抽牌数。 |
| `lineOrder` | `bottom-to-top` | 明确爻线记录顺序，避免被视觉上的自上而下排版误读。 |

## 2.3 `question`：问题快照

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `text` | 字符串 | 用户原始问题；属于敏感私密内容，分享时默认应脱敏。 |
| `locale` | 字符串 | 输入语言，例如 `zh-CN`。 |
| `timeframe` | 字符串或 `null` | 用户自述的观察时段；不是系统预测的日期。 |
| `submittedAt` | ISO 8601 字符串 | 问题确认、仪式开始的时间快照。 |

问题不可在同一次已完成阅读中被就地改写；若要更换问题，应开启新的阅读 ID。

## 2.4 `rounds`：六轮与六爻

`rounds` 必须严格包含 6 项，且 `roundIndex`、`lineIndex` 均依次为 1–6。第 1 轮就是初爻，第 6 轮就是上爻。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `roundIndex` | 整数 1–6 | 抽取轮次。与 `lineIndex` 相同，保留两者是为了同时表达仪式顺序与卦的爻位。 |
| `lineIndex` | 整数 1–6 | 爻位，1 为初爻，6 为上爻；始终自下而上。 |
| `linePosition` | 枚举 | `initial`、`second`、`third`、`fourth`、`fifth`、`top`。便于跨语言显示。 |
| `lineLabel` | 字符串 | 对应中文传统名称：初爻、二爻、三爻、四爻、五爻、上爻。 |
| `tarotCards` | 长度为 3 的数组 | 本爻的三张辅助图像与正逆位。 |
| `threeCardValues` | 长度为 3 的数组 | 由三张牌依序得出的 `[2/3, 2/3, 2/3]`，用于审计映射。 |
| `lineValue` | `6`、`7`、`8` 或 `9` | 三张 `coinValue` 的总和；这是本爻的传统三币法结果。 |
| `linePolarity` | `yin` 或 `yang` | 本卦中的阴阳：6/8 为阴，7/9 为阳。 |
| `lineAge` | `old` 或 `young` | 6/9 为老爻，7/8 为少爻。 |
| `isMoving` | 布尔值 | 只有 6（老阴）和 9（老阳）为 `true`。 |
| `changedPolarity` | `yin` 或 `yang` | 该爻在变卦中的阴阳；6 变阳、9 变阴、7/8 不变。 |

### `rounds[*].tarotCards`：单张牌字段

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `drawIndex` | 整数 1–3 | 此牌在本轮三张中的抽取顺序；不是独立牌位含义。 |
| `cardId` | 字符串 | 对应既有塔罗牌数据的稳定 ID。 |
| `name` / `englishName` | 字符串 | 为历史快照保留的中英文牌名；不应依赖未来牌库文案仍不变。 |
| `orientation` | `upright` 或 `reversed` | 正位或逆位。 |
| `coinValue` | `2` 或 `3` | 正位固定为 2，逆位固定为 3。 |

### 不可变映射表

| 三张牌的总和 | 本卦爻 | 爻龄 | 动爻 | 变卦爻 |
| ---: | --- | --- | --- | --- |
| `6` | 阴 | 老阴 | 是 | 阳 |
| `7` | 阳 | 少阳 | 否 | 阳 |
| `8` | 阴 | 少阴 | 否 | 阴 |
| `9` | 阳 | 老阳 | 是 | 阴 |

## 2.5 `tarotCards`：扁平检索索引

顶层 `tarotCards` 是对六轮中所有卡牌的重复索引，完成阅读时固定为 18 项。每项至少应包含：

| 字段 | 说明 |
| --- | --- |
| `globalDrawIndex` | 全局抽取序号 1–18；计算方式为 `(roundIndex - 1) × 3 + drawIndex`。 |
| `roundIndex` / `lineIndex` / `drawIndex` | 回指唯一的轮次、爻位和轮内顺序。 |
| `cardId` / `orientation` / `coinValue` | 必须与对应 `rounds` 内的同一张牌完全一致。 |

该索引不可成为第二个计算来源。读取或校验时，应以 `rounds` 为准并可重建它。

## 2.6 卦象对象：`primaryHexagram` 与 `changedHexagram`

两个对象结构相同，分别描述本卦和变卦。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `kingWenNumber` | 整数 1–64 | 采用文王六十四卦序的卦序号。 |
| `name` / `englishName` | 字符串 | 卦名的中英文快照。 |
| `lowerTrigram` | 字符串 | 下卦（第 1–3 爻）的中文八卦名。 |
| `upperTrigram` | 字符串 | 上卦（第 4–6 爻）的中文八卦名。 |
| `linePatternBottomToTop` | 长度为 6 的数组 | `yin` / `yang` 数组，严格记录从初爻到上爻的结构。 |

`primaryHexagram.linePatternBottomToTop` 必须等于各轮 `linePolarity` 的顺序；`changedHexagram.linePatternBottomToTop` 必须等于各轮 `changedPolarity` 的顺序。

## 2.7 `movingLineIndexes`：动爻索引

这是所有 `isMoving: true` 的 `lineIndex` 集合：

- 使用 1-based 索引；`1` 表示初爻，`6` 表示上爻。
- 固定从小到大排序，例如 `[1, 4, 6]`。
- 没有动爻时必须为 `[]`，此时变卦应与本卦完全相同。
- 它是方便展示和查询的派生字段，必须能由 `rounds` 重新计算。

## 2.8 `interpretation`：可展示的解读快照

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `status` | 枚举 | `pending`、`generated`、`reviewed`、`failed`。 |
| `source` | 枚举或字符串 | 如 `future-ai-or-editorial`、`ai`、`editorial`。标明解释来源。 |
| `summary` | 字符串或 `null` | 面向用户的整体“势”摘要。 |
| `lineInterpretations` | 数组 | 未来保存从初爻到上爻的逐爻解释。每项应回指 `lineIndex`，并以爻义为主、三张牌为辅助。 |
| `interpretationSnapshot` | 对象或 `null` | 完整、不可变的展示快照，包括本卦、动爻、变卦、六爻、塔罗辅助象意、引用版本和安全提示。 |
| `generatedAt` | ISO 8601 字符串或 `null` | 本版本解读生成完成时间。 |

`interpretationSnapshot` 一旦保存，不应被未来模型或文本库的升级覆盖。若用户请求新解读，应新增版本到 `ai.regenerationHistory`，而不是修改原快照。

## 2.9 `ai`：未来 AI 溯源与再解读预留

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `status` | 枚举 | `not-requested`、`queued`、`processing`、`completed`、`failed`。 |
| `model` | 字符串或 `null` | 生成该解读的模型标识。 |
| `promptVersion` | 字符串或 `null` | 解读提示词版本，保障结果可追溯。 |
| `sourceVersion` | 字符串或 `null` | 所用卦辞、爻辞、塔罗牌义和安全规则资料版本。 |
| `generatedAt` | ISO 8601 字符串或 `null` | AI 请求完成时间。 |
| `regenerationHistory` | 数组 | 新解读版本的不可变记录；每项应保存请求时间、模型、提示词／资料版本、结果快照与失败原因（若有）。 |

未来 AI 必须先读取本卦、动爻、变卦和六爻，再将每轮塔罗作为象意佐证；不能把 18 张牌解释成脱离六爻的第二套结论。

## 2.10 `history` 与 `sharing`：历史和分享预留

### `history`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `ownerId` | 字符串或 `null` | 归属用户的稳定标识；匿名阅读可为空。 |
| `visibility` | `private`、`unlisted` 或 `public` | 默认 `private`。 |
| `archivedAt` | ISO 8601 字符串或 `null` | 用户主动归档的时间。 |
| `deletedAt` | ISO 8601 字符串或 `null` | 软删除时间，支持恢复与隐私处理。 |
| `tags` | 字符串数组 | 用户自定义归档标签；不得改变卦或牌的计算含义。 |

### `sharing`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `status` | `disabled`、`active`、`revoked`、`expired` | 分享链接生命周期。 |
| `shareId` | 字符串或 `null` | 仅用于公开链接的非顺序标识。 |
| `publicUrl` | 字符串或 `null` | 分享地址；未启用分享时为 `null`。 |
| `access` | `private`、`link` 或 `public` | 控制谁可阅读分享副本。 |
| `expiresAt` | ISO 8601 字符串或 `null` | 可选到期时间。 |
| `redactedFields` | 字符串数组 | 分享副本必须移除或替换的字段路径；默认至少包含 `question.text`。 |

分享应基于冻结的阅读快照生成副本，避免外部访问者看到所有者信息、内部 AI 元数据或已删除内容。

## 2.11 `timestamps`：时间记录

| 字段 | 说明 |
| --- | --- |
| `createdAt` | 创建阅读草稿的时间。 |
| `completedAt` | 六轮、两卦和派生字段校验完成的时间；未完成时可为 `null`。 |
| `updatedAt` | 最近一次元数据、解读、归档或分享状态更新的时间。 |

所有时间使用包含时区偏移的 ISO 8601 格式，避免跨时区历史排序歧义。

---

# 3. 数据生成与流转

```text
用户问题
  ↓ 固化问题快照（question）
六轮抽取，每轮三张塔罗
  ↓ 每张正位 = 2；逆位 = 3
三张数值相加为一个 lineValue（6 / 7 / 8 / 9）
  ↓ 生成第 1–6 爻（rounds，自下而上）
六条本卦爻线组合
  ↓ primaryHexagram
识别数值为 6 或 9 的动爻
  ↓ movingLineIndexes
翻转全部动爻，静爻保持不变
  ↓ changedHexagram
卦、动爻、变卦优先；每爻三张塔罗补充象意
  ↓ interpretation / interpretationSnapshot
```

## 3.1 从问题到 18 张牌

1. 用户提交一个完整问题，系统写入 `question` 并记录 `submittedAt`。
2. 系统开始固定的六轮仪式；每轮抽取三张牌，因此总数固定为 18。
3. 每张牌保存牌 ID、显示名快照、正逆位和映射数值。正位只能为 `2`，逆位只能为 `3`。
4. 每张牌通过 `roundIndex`、`lineIndex` 与 `drawIndex` 被唯一地归属到一条爻，不能成为独立于六爻之外的牌位。

## 3.2 从三张牌到一条爻

每轮将三张 `coinValue` 求和，得到唯一合法值 `6`、`7`、`8` 或 `9`：

- `6`：老阴，本卦为阴，且为动爻，变卦翻为阳。
- `7`：少阳，本卦与变卦均为阳，静爻。
- `8`：少阴，本卦与变卦均为阴，静爻。
- `9`：老阳，本卦为阳，且为动爻，变卦翻为阴。

结果写入该轮的 `lineValue`、`linePolarity`、`lineAge`、`isMoving` 与 `changedPolarity`。`threeCardValues` 与各牌的 `coinValue` 同时保存，用于审计和复算。

## 3.3 从六爻到本卦与变卦

1. 依次读取 `rounds[0]` 至 `rounds[5]` 的 `linePolarity`，形成 `primaryHexagram.linePatternBottomToTop`。
2. 由下三爻识别下卦、上三爻识别上卦，再依据文王卦序解析本卦编号与名称。
3. 把每个 `isMoving: true` 的 `lineIndex` 收集为 `movingLineIndexes`。
4. 依次读取六条 `changedPolarity`，形成变卦线型；同样依据文王卦序解析 `changedHexagram`。
5. 若 `movingLineIndexes` 为空，变卦线型、本卦编号和变卦编号都必须与本卦相同。

## 3.4 从卦象到解读

解读输入按如下优先级组织：

1. 原始问题和用户声明的观察时段；
2. 本卦的整体结构；
3. 动爻的位置、阴阳翻转及其变化焦点；
4. 变卦代表的变化展开后结构；
5. 从初爻到上爻的逐爻意义；
6. 每一爻对应的三张塔罗牌，作为该爻在内在状态、现实关系与行动线索上的辅助图像。

最终展示结果写入不可变的 `interpretation.interpretationSnapshot`。解读不得将塔罗置于卦象之前，也不得输出确定性的命运预言。

---

# 4. 校验规则与数据不变量

未来实现必须在写入 `completed` 阅读前满足以下条件：

1. `rounds` 恰好 6 项；每一项恰好 3 张 `tarotCards`。
2. 第 `n` 轮的 `roundIndex`、`lineIndex` 必须均为 `n`，其中 `n` 属于 1–6。
3. 每张牌的 `orientation` 与 `coinValue` 强制对应：`upright → 2`，`reversed → 3`。
4. 每轮 `threeCardValues` 必须与三张牌的 `coinValue` 顺序一致，且 `lineValue` 必须是它们的总和。
5. `lineValue` 只能为 6、7、8、9；其他值视为无效数据。
6. `linePolarity`、`lineAge`、`isMoving` 与 `changedPolarity` 必须完全符合不可变映射表。
7. `movingLineIndexes` 必须与所有动爻一一对应、去重并递增排序。
8. 两个卦象的六爻线型分别必须与 `linePolarity`、`changedPolarity` 对应。
9. `tarotCards` 必须可由 `rounds` 无损重建；若冲突，拒绝写入或以 `rounds` 修复索引。
10. `completedAt` 不得早于 `createdAt`；所有可选未来字段为 `null` 或空数组时也必须保持合法 JSON。

---

# 5. 未来 AI、分享与历史的演进边界

## 5.1 AI 解释

AI 字段只记录生成过程和冻结结果，不参与卦象计算。任何模型、提示词或资料版本的变化，都不得重新解释或篡改已经保存的 `interpretationSnapshot`。

若未来要提供“以最新资料再解读”，应：

1. 保留原阅读的六轮、牌、爻、本卦和变卦不变；
2. 在 `ai.regenerationHistory` 追加新的版本记录；
3. 清楚标记新旧模型、资料、提示词与生成时间；
4. 允许用户选择阅读哪一个版本；
5. 继续遵守“爻为主、塔罗为辅”的解释顺序。

## 5.2 历史记录

历史能力只应改变归档、可见性和标签，不应改动仪式事实。软删除须以 `deletedAt` 标记，以便未来实现合规删除、恢复或数据导出流程。

## 5.3 对外分享

用户问题可能高度私密。分享功能默认不公开 `question.text`，并应基于 `redactedFields` 生成明确的脱敏副本。分享链接失效、撤销或历史删除后，外部副本必须不可继续访问。

---

# 6. 实现者速查

- 一次阅读 = 1 个问题 + 6 轮 + 18 张牌 + 6 爻 + 本卦 + 动爻集合 + 变卦。
- 正位 = 2，逆位 = 3；每轮总和只能为 6、7、8、9。
- 6 / 9 是动爻；6 阴变阳，9 阳变阴。
- 爻位 1 是最下方初爻，爻位 6 是最上方上爻。
- `rounds` 为事实来源，`tarotCards`、`movingLineIndexes` 与两卦线型均可由其校验或推导。
- 卦与爻决定解释结构；塔罗只为所属爻补充“象”。
- 历史解释以不可变快照保存；再解读只能新增版本，不能覆盖旧结果。
