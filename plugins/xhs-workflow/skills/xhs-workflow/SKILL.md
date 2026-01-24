# xhs-workflow Skill - 小红书母婴内容工作流编排

主工作流编排技能，协调各子 Agent 完成从素材研究到文章输出的完整流程。

---

## 技能概述

**角色：** 工作流编排器（Orchestrator）
**职责：**
- 解析用户指令
- 调度子 Agent
- 读取报告摘要
- 管理用户交互
- 整合最终输出

**上下文策略：** 保持轻量（~20-30K tokens），通过子 Agent 分离执行各环节

---

## 工作流阶段

### 0️⃣ 多平台研究（可选）

**触发条件：** 用户指定 `--research` 参数或未提供源 URL

**执行方式：**
```
调用子 Agent：
Task(
  subagent_type: "general-purpose",
  prompt: "你是 Research Agent。请执行以下任务：

  1. 阅读 .claude/skills/research/SKILL.md 了解研究技能
  2. 使用 WebSearch 检索关键词：{keywords}
  3. 按质量评分标准打分
  4. 输出标准化报告到：{working_dir}/research-report.md

  关键词：{keywords}
  工作目录：{working_dir}",
  run_in_background: false
)
```

**用户交互：** 展示 Top 5 推荐，等待用户选择

**输出文件：** `research-report.md`

---

### 1️⃣ 素材获取与翻译

**触发条件：** 用户选择了资源或提供了源 URL

**执行方式：**
```
调用子 Agent：
Task(
  subagent_type: "general-purpose",
  prompt: "你是 Translator Agent。请执行以下任务：

  1. 阅读 .claude/skills/translator/SKILL.md 了解翻译技能
  2. 使用 WebFetch 获取源 URL 内容：{source_url}
  3. 按翻译指南进行翻译，保留专业术语
  4. 输出标准化报告到：{working_dir}/translation-report.md
  5. 输出完整译文到：{working_dir}/translated-content.md

  源 URL：{source_url}
  工作目录：{working_dir}",
  run_in_background: true
)
```

**输出文件：** `translation-report.md`, `translated-content.md`

---

### 2️⃣ 本地化改编

**执行方式：**
```
调用子 Agent：
Task(
  subagent_type: "general-purpose",
  prompt: "你是 Localizer Agent。请执行以下任务：

  1. 阅读 .claude/skills/localizer/SKILL.md 了解本地化技能
  2. 读取译文：{working_dir}/translated-content.md
  3. 按本地化指南进行改编
  4. 输出标准化报告到：{working_dir}/localization-report.md
  5. 输出本地化内容到：{working_dir}/localized-content.md

  工作目录：{working_dir}",
  run_in_background: true
)
```

**输出文件：** `localization-report.md`, `localized-content.md`

---

### 3️⃣ 选题与标题优化

**执行方式：**
```
调用子 Agent：
Task(
  subagent_type: "general-purpose",
  prompt: "你是 Topic Agent。请执行以下任务：

  1. 阅读 .claude/skills/xhs-workflow/references/topic-generator.md
  2. 读取本地化内容：{working_dir}/localized-content.md
  3. 生成 A/B/C 三个选题方案
  4. 输出标准化报告到：{working_dir}/topic-report.md

  工作目录：{working_dir}",
  run_in_background: false
)
```

**用户交互：** 展示三个方案，等待用户选择 A/B/C

**输出文件：** `topic-report.md`

---

### 4️⃣ 事实核查 ⚠️

**执行方式：**
```
调用子 Agent：
Task(
  subagent_type: "general-purpose",
  prompt: "你是 Fact-Check Agent。请执行以下任务：

  1. 阅读 .claude/skills/fact-checker/SKILL.md 了解核查规则
  2. 读取待核查内容：{working_dir}/localized-content.md
  3. 按母婴安全核查标准逐项检查
  4. 输出标准化报告到：{working_dir}/fact-check-report.md
  5. 输出核查后内容到：{working_dir}/fact-checked-content.md

  工作目录：{working_dir}",
  run_in_background: false
)
```

**用户交互：** 如有 ⚠️ 项需确认处理方式

**输出文件：** `fact-check-report.md`, `fact-checked-content.md`

---

### 5️⃣ 小红书风格写作

**执行方式：**
```
调用子 Agent：
Task(
  subagent_type: "general-purpose",
  prompt: "你是 Writer Agent。请执行以下任务：

  1. 阅读 .claude/skills/xhs-styles/SKILL.md 了解文风技能
  2. 阅读对应文风定义：.claude/skills/xhs-styles/references/{style}.md
  3. 阅读个人背景：writing-system/background/（如果存在）
  4. 读取核查后内容：{working_dir}/fact-checked-content.md
  5. 读取选题方案：{working_dir}/topic-report.md（用户选择的方案）
  6. 按文风和选题进行创作
  7. 输出标准化报告到：{working_dir}/writing-report.md
  8. 输出文章草稿到：{working_dir}/article-draft.md

  选择的文风：{style}
  选择的方案：{topic_choice}
  工作目录：{working_dir}",
  run_in_background: true
)
```

**输出文件：** `writing-report.md`, `article-draft.md`

---

### 6️⃣ 审校（去AI味）

**执行方式：**
```
调用子 Agent：
Task(
  subagent_type: "general-purpose",
  prompt: "你是 De-AI Agent。请执行以下任务：

  1. 阅读 .claude/skills/de-ai-ification/SKILL.md 了解去AI味技能
  2. 读取文章草稿：{working_dir}/article-draft.md
  3. 按去AI味模式库进行处理
  4. 输出标准化报告到：{working_dir}/deai-report.md
  5. 输出最终文章到：{working_dir}/article-final.md

  工作目录：{working_dir}",
  run_in_background: true
)
```

**输出文件：** `deai-report.md`, `article-final.md`

---

### 7️⃣ 配图生成

**执行方式：**
```
调用子 Agent：
Task(
  subagent_type: "general-purpose",
  prompt: "你是 Image Agent。请执行以下任务：

  1. 阅读 .claude/skills/image-generation/SKILL.md 了解配图技能
  2. 读取写作报告：{working_dir}/writing-report.md（提取配图需求）
  3. 读取最终文章：{working_dir}/article-final.md
  4. 为每个配图需求生成优化提示词
  5. 调用配图 API 或输出提示词供手动生成
  6. 输出标准化报告到：{working_dir}/image-report.md
  7. 保存图片到：{working_dir}/images/

  工作目录：{working_dir}",
  run_in_background: false
)
```

**用户交互：** 如 API 故障，提示手动生成选项

**输出文件：** `image-report.md`, `images/`

---

### 📤 输出整合

**执行内容：**
1. 创建输出目录
2. 复制最终文章和配图
3. 生成元数据文件
4. 展示完成摘要给用户

---

## 报告模板位置

所有报告模板定义在 `references/` 目录：
- `references/topic-generator.md` - 选题生成指南
- `references/fact-checker.md` - 事实核查指南（母婴专用）
- `references/writer.md` - 写作指南
- `references/editor.md` - 审校指南

---

## 错误处理

| 错误类型 | 处理方式 |
|----------|----------|
| 子 Agent 超时 | 重试一次，失败则提示用户 |
| 报告文件缺失 | 检查子 Agent 输出，重新执行 |
| 用户取消 | 保存当前进度，可从断点恢复 |
| API 故障 | 使用故障转移策略 |

---

## 断点恢复

如果任务中断，可以通过读取 `{working_dir}/task-config.yaml` 恢复：

```yaml
task_id: xhs-20260120-001
status: in_progress
current_step: 5
completed_steps:
  - research
  - translation
  - localization
  - topic
  - fact-check
user_choices:
  research_selection: [1, 3]
  topic_choice: A
  style: 温暖妈妈型
```

---

## 并行化策略

以下步骤可以并行执行：
- 1️⃣ 翻译完成后，2️⃣ 本地化可立即开始
- 5️⃣ 写作完成后，6️⃣ 去AI味和 7️⃣ 配图提示词生成可并行

以下步骤必须串行：
- 4️⃣ 安全核查必须在写作前完成
- 配图生成必须等待文章定稿
