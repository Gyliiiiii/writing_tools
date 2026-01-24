# image-generation Skill - 多API配图生成

小红书母婴内容配图生成技能，支持封面和文内配图。

---

## 技能概述

**目的：** 为文章生成封面和配图
**主选API：** Google Nano Banana Pro
**故障策略：** 输出提示词供手动生成

---

## API 配置

### 主选：Google Nano Banana Pro

| 配置项 | 值 |
|--------|---|
| Provider | Google |
| Model | Nano Banana Pro |
| API Endpoint | `https://generativelanguage.googleapis.com/v1beta/models/nano-banana-pro:generateImage` |
| 认证 | `GOOGLE_AI_API_KEY` |
| 尺寸 | 1024x1024 |
| 比例 | 1:1 / 16:9 / 9:16 / 4:3 |

### 配置示例

```yaml
# writing-system/config.yaml
image_generation:
  primary_api: "google-nano-banana-pro"

  apis:
    google-nano-banana-pro:
      enabled: true
      api_key: "${GOOGLE_AI_API_KEY}"
      api_endpoint: "https://generativelanguage.googleapis.com/v1beta/models/nano-banana-pro:generateImage"
      size: "1024x1024"
      aspect_ratio: "1:1"
      safety_settings: "balanced"

  fallback_strategy: "output_prompt"
  monthly_budget: "$50"
```

---

## 故障转移策略

当 API 故障时，输出优化提示词供手动生成：

### 备选平台

| 平台 | 链接 | 推荐度 |
|------|------|--------|
| ChatGPT (DALL-E) | https://chat.openai.com | ⭐⭐⭐⭐⭐ |
| Midjourney | https://midjourney.com | ⭐⭐⭐⭐⭐ |
| 通义万相 | https://tongyi.aliyun.com/wanxiang | ⭐⭐⭐⭐ |
| 文心一格 | https://yige.baidu.com | ⭐⭐⭐ |

### 故障处理流程

```
API 调用失败
    ↓
输出优化提示词
    ↓
提供备选平台链接
    ↓
用户手动生成
    ↓
上传到 working/images/
```

---

## 配图类型

### 1. 封面图 (Cover)

**尺寸：** 1:1 或 3:4
**要求：** 吸引眼球、主题明确、有品质感

**提示词模板：**
```
A warm [adjective] illustration of [subject],
[setting/environment],
[lighting],
[style],
high quality, professional
```

### 2. 内容配图 (Content)

**尺寸：** 1:1 或 4:3
**类型：**
- 场景插图（情感表达）
- 信息图表（步骤流程）
- 教育插图（操作示意）

### 3. 信息图 (Infographic)

**尺寸：** 9:16 或 3:4
**要求：** 清晰易读、信息准确

---

## Prompt 工程

### 基础结构

```
[主体描述] + [环境背景] + [色彩氛围] + [艺术风格] + [技术参数]
```

### 母婴内容专用元素

| 元素 | 推荐关键词 |
|------|------------|
| 人物 | Asian baby, Asian mother, gentle expression |
| 色调 | soft pink and blue, warm tones, pastel colors |
| 氛围 | cozy, peaceful, loving, nurturing |
| 风格 | illustration style, watercolor, modern minimalist |
| 光线 | soft ambient lighting, warm morning light |

### 示例提示词

#### 睡眠主题封面
```
A serene illustration of a peaceful Asian baby sleeping in a modern nursery,
soft blue and pink tones,
warm ambient lighting,
scientific infographics about sleep cycles in the corner,
modern minimalist style,
high quality, professional illustration
```

#### 喂养主题封面
```
A warm illustration of Asian mother feeding baby with colorful healthy baby food,
bright kitchen background,
soft natural lighting,
friendly and inviting atmosphere,
clean modern illustration style
```

#### 疲惫妈妈场景
```
Tired but loving Asian mother gently holding crying baby at night,
cozy nursery setting,
soft lamp lighting,
warm and empathetic mood,
illustration style with soft edges
```

#### 安睡宝宝场景
```
Peaceful sleeping Asian baby in comfortable crib,
soft morning light through window,
pastel colored nursery,
serene and calm atmosphere,
high quality illustration
```

---

## 执行流程

### 1. 提取配图需求

从 `writing-report.md` 中提取：
```markdown
## 🖼️ 配图需求

### IMAGE_1
**位置**: 第1节
**描述**: 疲惫的妈妈和夜醒的宝宝
**情绪**: 疲惫但温暖
**类型**: 场景插图
```

### 2. 生成提示词

```
根据描述生成优化提示词：
- 分析情绪和氛围
- 添加母婴专用元素
- 匹配风格要求
```

### 3. 调用 API

```python
# 伪代码
for image in image_requirements:
    prompt = generate_optimized_prompt(image)

    try:
        result = call_api(prompt)
        save_image(result, f"images/{image.id}.png")
    except APIError:
        fallback_prompt = format_fallback_prompt(prompt)
        add_to_report(fallback_prompt, manual_platforms)
```

### 4. 输出报告

生成配图报告，包含成功的图片预览和失败的手动提示词。

---

## 输出报告格式

```markdown
# 🖼️ 配图生成报告

## 元信息
- 配图需求: {count} 张
- 使用API: Google Nano Banana Pro
- 总耗时: {duration}
- 总成本: ~${cost}

## 📊 生成结果

### 封面图 (cover.png)
- **状态**: ✅ 生成成功
- **API**: Google Nano Banana Pro
- **尺寸**: 1024x1024
- **提示词**: "{prompt}"
- **预览**: ![cover](working/{task_id}/images/cover.png)

### IMAGE_1 (01-{name}.png)
- **状态**: ✅ 生成成功
- **预览**: ![img1](working/{task_id}/images/01-{name}.png)

### IMAGE_2 (02-{name}.png)
- **状态**: ⚠️ API 故障，已输出提示词
- **问题**: {error_message}
- **输出提示词**:
  ```
  {fallback_prompt}
  ```
- **备选平台**:
  - ChatGPT (DALL-E): https://chat.openai.com
  - Midjourney: https://midjourney.com
  - 通义万相: https://tongyi.aliyun.com/wanxiang
- **用户决策**: [ ] 手动生成后上传 / [ ] 使用备选提示词重试

## 💰 成本汇总
| API | 调用次数 | 成本 |
|-----|---------|------|
| Google Nano Banana Pro | {count} | ~${cost} |
| 手动生成 | {count} | 免费 |
| **总计** | {total} | ~${total_cost} |

## 📁 文件位置
所有图片已保存到: working/{task_id}/images/

## ⏭️ 下一步
{next_steps}
```

---

## 风格预设

### 预设1：温馨插画
```yaml
style: "warm illustration"
colors: "soft pink, light blue, cream"
lighting: "warm ambient"
mood: "cozy, loving"
```

### 预设2：专业科普
```yaml
style: "clean infographic"
colors: "white, light blue, accent colors"
lighting: "even, bright"
mood: "professional, trustworthy"
```

### 预设3：活泼可爱
```yaml
style: "playful cartoon"
colors: "bright, colorful"
lighting: "bright, cheerful"
mood: "fun, energetic"
```

---

## 参考文件

- `references/api-config.md` - API 详细配置
- `references/cover-templates.md` - 封面模板库
- `references/style-presets.md` - 风格预设详细定义
