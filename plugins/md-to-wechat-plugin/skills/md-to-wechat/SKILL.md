---
name: md-to-wechat
description: Markdown 转微信公众号发布工具 - 将 Markdown 文件转换为 HTML 并发布到微信公众号草稿箱。使用场景：(1) 用户提供 Markdown 文件需要发布到微信公众号，(2) 用户说"把这个 MD 发到公众号"、"Markdown 转微信"、"发布 MD 到微信"等。首次使用需要配置 AppID、AppSecret 和作者信息，并提供 IP 白名单提示。
---

# Markdown 转微信公众号发布工具

将 Markdown 文件转换为适合微信公众号的 HTML 格式，并直接发布到草稿箱。

## 功能特点

- ✅ Markdown 自动转换为微信适配的 HTML
- ✅ 内联样式，完美适配微信公众号
- ✅ 直接调用微信 API，无需 MCP Server
- ✅ 首次使用引导配置，提供 IP 白名单提示
- ✅ 支持上传封面图片
- ✅ 灵活的凭证管理

## 工作流程

### 步骤 1: 检查配置

首次使用时，需要配置微信公众号凭证。

**检查 .env 文件是否存在：**

```bash
ls .env
```

如果文件不存在，执行步骤 2 进行配置。如果存在，跳到步骤 3。

### 步骤 2: 首次配置

**2.1 获取用户的公网 IP 地址**

运行以下命令获取用户当前的公网 IP：

```bash
curl -s https://api.ipify.org
```

**2.2 提示用户配置白名单**

告知用户：

```
⚠️  重要提示：

您的公网 IP 地址是: [显示获取到的IP]

请前往微信公众平台添加 IP 白名单：
1. 登录 https://mp.weixin.qq.com
2. 进入"设置与开发" -> "基本配置"
3. 在"IP白名单"中添加上述 IP 地址
4. 保存后等待 5 分钟生效

完成后，请提供以下信息：
- AppID（必填）
- AppSecret（必填）
- 作者名称（可选，默认为空）
```

**2.3 收集配置信息**

使用 AskUserQuestion 工具询问用户提供：
- AppID
- AppSecret
- 作者名称（可选）


**2.4 创建配置文件**

将用户提供的信息写入 `.env` 文件：

```bash
cat > .env << 'ENVEOF'
WECHAT_APP_ID=用户提供的AppID
WECHAT_APP_SECRET=用户提供的AppSecret
DEFAULT_AUTHOR=用户提供的作者名称
ENVEOF
```

**2.5 确认配置完成**

告知用户：
```
✅ 配置已保存！
现在可以开始使用 Markdown 转微信公众号功能了。
```

### 步骤 3: Markdown 转 HTML

**3.1 读取 Markdown 文件**

使用 Read 工具读取用户提供的 Markdown 文件。

**3.2 转换为微信适配的 HTML**

调用转换脚本：

```bash
node md-to-html.js <markdown-file-path> <output-html-path>
```

脚本会自动：
- 将 Markdown 转换为 HTML
- 应用微信公众号适配的内联样式
- 优化移动端阅读体验
- 提取文章标题


### 步骤 4: 发布到微信公众号

**4.1 准备封面图片**

询问用户是否提供封面图片：
- 如果提供，使用用户指定的图片路径
- 如果未提供，提示用户封面图片是必需的

**4.2 调用发布脚本**

```bash
node html-to-wechat-draft.js \
  --html <html-file-path> \
  --title "文章标题" \
  --thumb <cover-image-path> \
  --author "作者名称" \
  --digest "文章摘要"
```

脚本会自动：
1. 读取 `.env` 配置
2. 获取 Access Token
3. 上传封面图片
4. 创建草稿
5. 返回草稿的 Media ID

**4.3 显示结果**

告知用户发布成功，并提供：
```
✅ 草稿创建成功！
📝 Media ID: [显示Media ID]

请登录微信公众平台查看草稿箱：
https://mp.weixin.qq.com
```


## 使用示例

### 示例 1: 基本使用

**用户输入：**
```
把 article.md 发布到微信公众号
封面图：cover.jpg
```

**执行流程：**
1. 检查配置（如果首次使用，引导配置）
2. 转换 MD → HTML
3. 上传封面图片
4. 发布到草稿箱
5. 返回 Media ID

### 示例 2: 完整参数

**用户输入：**
```
发布 Markdown 到公众号
- 文件：tech-article.md
- 标题：AI 技术分享
- 作者：张三
- 摘要：这是一篇关于 AI 的技术文章
- 封面：tech-cover.png
```

**执行流程：**
同上，但会使用用户提供的完整参数。


## 注意事项

### 封面图片要求
- 格式：JPG 或 PNG
- 大小：不超过 64KB
- 建议尺寸：900x500 像素

### Markdown 支持
- 标题（H1-H3）
- 段落和换行
- 粗体和斜体
- 列表（有序和无序）
- 代码块和行内代码
- 引用
- 表格
- 链接和图片
- 水平线

### 草稿箱限制
- 草稿箱最多可保存 100 篇草稿
- 草稿不会自动发布，需要在公众平台手动发布


## 错误处理

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| 获取 Access Token 失败 | AppID 或 AppSecret 错误 | 检查凭证是否正确 |
| IP 白名单错误 | IP 未添加到白名单 | 添加 IP 到微信公众平台 |
| 封面图片上传失败 | 图片大小超限或格式不对 | 压缩图片或转换格式 |
| 创建草稿失败 | 草稿箱已满 | 删除旧草稿 |
| Markdown 文件不存在 | 路径错误 | 检查文件路径 |

## 技术实现

本 skill 包含两个核心脚本：

1. **md-to-html.js**: Markdown 转 HTML
   - 使用 marked 库解析 Markdown
   - 自定义渲染器应用微信样式
   - 所有样式使用内联方式

2. **html-to-wechat-draft.js**: HTML 发布到微信
   - 使用 axios 调用微信 API
   - 使用 form-data 上传图片
   - 支持从 .env 读取配置

## 配置文件格式

`.env` 文件示例：

```bash
WECHAT_APP_ID=wx1234567890abcdef
WECHAT_APP_SECRET=abcdef1234567890abcdef1234567890
DEFAULT_AUTHOR=张三
```
