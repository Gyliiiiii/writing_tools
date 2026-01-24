# /xhs 命令 - 小红书母婴内容工作流

小红书母婴育儿内容创作主入口命令。将国外母婴内容本地化为中文小红书风格文章。

---

## 📏 字数规范

| 元素 | 字数要求 |
|------|----------|
| **标题** | ≤ 20字（含emoji） |
| **正文** | 约 1000字 |
| **标签** | 5-8个 |

---

## 命令参数

用户可通过以下方式调用：

```bash
# 基础用法 - 从URL翻译改写
/xhs --source "https://example.com/baby-sleep-tips"

# 指定文风
/xhs --source "URL" --style "闺蜜分享型"

# 先研究再创作
/xhs --research "婴儿睡眠训练"

# 从素材库创作
/xhs --material "sleep-training/method-comparison.md"
```

### 参数说明

| 参数 | 说明 | 示例 |
|------|------|------|
| `--source` | 国外博客URL | `--source "https://..."` |
| `--style` | 文风选择 | `温暖妈妈型`/`专业科普型`/`闺蜜分享型` |
| `--research` | 先进行多平台研究 | `--research "睡眠训练"` |
| `--material` | 使用素材库文件 | `--material "feeding/intro.md"` |
| `--topic` | 指定主题分类 | `--topic "睡眠训练"` |

---

## 执行流程

### 完整 8 步工作流

```
0️⃣ 多平台研究（可选）→ 发现和精选素材
1️⃣ 素材获取与翻译 → 从选定来源抓取并翻译
2️⃣ 本地化改编 → 适配中国市场和习惯
3️⃣ 选题与标题优化 → 生成吸引人的角度
4️⃣ 事实核查 ⚠️ → 母婴安全验证
5️⃣ 小红书风格写作 → 按选定文风撰写
6️⃣ 审校（去AI味）→ 让内容更自然
7️⃣ 配图生成 → 封面和配图生成
📤 输出 → 整合所有文件
```

---

## 执行指令

收到此命令后，请按以下步骤执行：

### 步骤 1：解析参数

从用户输入中提取：
- `source`: 源URL（如果有）
- `style`: 文风（默认：温暖妈妈型）
- `research`: 研究关键词（如果有）
- `material`: 素材文件路径（如果有）
- `topic`: 主题分类

### 步骤 2：创建工作目录

```bash
# 生成任务ID
task_id="xhs-$(date +%Y%m%d)-$(printf '%03d' $((RANDOM % 1000)))"
working_dir="writing-system/working/$task_id"
mkdir -p "$working_dir/images"
```

### 步骤 3：执行工作流

根据参数决定起始步骤：

**如果有 `--research` 参数：**
1. 调用 `research` Skill 进行多平台研究
2. 展示 Top 5 推荐资源给用户选择
3. 用户选择后，继续到翻译步骤

**如果有 `--source` 参数：**
1. 直接从翻译步骤开始

**如果有 `--material` 参数：**
1. 读取素材文件，跳过翻译，从本地化开始

### 步骤 4：子 Agent 分离执行

为了优化上下文消耗，每个环节使用独立子 Agent：

```python
# 伪代码示例
for step in workflow_steps:
    # 启动子 Agent
    Task(
        subagent_type="general-purpose",
        prompt=f"执行 {step.skill} skill，输入：{step.input}，输出到：{working_dir}/{step.output}",
        run_in_background=step.can_background
    )

    # 读取报告
    report = Read(f"{working_dir}/{step.report}")

    # 如果需要用户交互
    if step.needs_user_input:
        user_choice = ask_user(step.prompt, step.options)
```

### 步骤 5：用户交互点

以下环节需要等待用户确认：

| 环节 | 交互内容 |
|------|----------|
| 0️⃣ Research | 选择使用哪些资源 |
| 3️⃣ 选题 | 选择 A/B/C 方案 |
| 4️⃣ 安全核查 | 确认 ⚠️ 项的处理方式 |
| 5️⃣ 写作 | 确认文风（如未指定） |
| 7️⃣ 配图 | 确认 API 故障时的处理 |

### 步骤 6：整合输出

```bash
output_dir="writing-system/outputs/$(date +%Y%m%d)-${title}"
mkdir -p "$output_dir/images"

# 复制最终文件
cp "$working_dir/article-final.md" "$output_dir/article.md"
cp "$working_dir/images/"* "$output_dir/images/"

# 生成元数据
cat > "$output_dir/metadata.yaml" << EOF
source_url: $source_url
created_at: $(date -Iseconds)
style: $style
topic: $topic
task_id: $task_id
EOF
```

---

## 调用的 Skills

| Skill | 用途 |
|-------|------|
| `research` | 多平台内容研究 |
| `translator` | 英文翻译 |
| `localizer` | 中国市场本地化 |
| `xhs-styles` | 小红书文风应用 |
| `fact-checker` | 母婴安全核查 |
| `de-ai-ification` | 去AI味处理 |
| `image-generation` | 配图生成 |

---

## 输出结构

```
writing-system/outputs/20260120-睡眠训练指南/
├── article.md          # 最终文章
├── cover.png           # 封面图
├── images/             # 配图
│   ├── 01.png
│   └── 02.png
└── metadata.yaml       # 元数据
```

---

## 示例对话

**用户：** `/xhs --research "婴儿辅食添加"`

**Claude：**
> 🔍 正在进行多平台研究...
>
> ## 📊 研究结果 - "婴儿辅食添加"
>
> | 排名 | 标题 | 来源 | 质量分 | URL |
> |------|------|------|--------|-----|
> | 1 | Starting Solids: A Complete Guide | Medium | 94/100 | [查看原文](https://medium.com/@pediatric-nutrition/starting-solids-guide) |
> | 2 | Baby-Led Weaning vs Purees | YouTube | 88/100 | [查看视频](https://youtube.com/watch?v=abc123) |
> | 3 | First Foods for 6-Month-Olds | Healthline | 82/100 | [查看原文](https://healthline.com/baby-first-foods) |
>
> ### 📋 URL 汇总
> | # | URL |
> |---|-----|
> | 1 | https://medium.com/@pediatric-nutrition/starting-solids-guide |
> | 2 | https://youtube.com/watch?v=abc123 |
> | 3 | https://healthline.com/baby-first-foods |
>
> 请选择要使用的资源序号（如 1 或 1,3）：

**用户：** `1`

**Claude：**
> ✅ 已选择资源 #1
> 📥 正在从 https://medium.com/@pediatric-nutrition/starting-solids-guide 获取内容...
> 🔄 翻译中...
>
> （继续后续步骤...）

---

## 错误处理

| 错误 | 处理方式 |
|------|----------|
| URL 无法访问 | 提示用户检查链接，或切换到研究模式 |
| 翻译失败 | 重试一次，失败则输出原文供人工翻译 |
| 安全核查发现❌项 | 强制修改，不可跳过 |
| 配图 API 故障 | 输出提示词供手动生成 |

---

## 配置文件

全局配置位于 `writing-system/config.yaml`，包含：
- API 密钥配置
- 默认文风设置
- 配图参数
- 输出目录设置
