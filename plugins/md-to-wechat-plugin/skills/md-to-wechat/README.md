# HTML 转微信公众号草稿 Skill

这是一个 Claude Code skill，用于将 HTML 文件快速转换并上传到微信公众号草稿箱。

## 快速开始

### 1. 配置凭证

在你的项目根目录创建 `.env` 文件：

```bash
WECHAT_APP_ID=your_app_id_here
WECHAT_APP_SECRET=your_app_secret_here
DEFAULT_AUTHOR=你的名字
DEFAULT_SOURCE_URL=https://your-blog.com
```

### 2. 使用 Skill

在 Claude Code 中，直接说：

```
把 article.html 发布到微信公众号
标题：我的文章标题
封面图：cover.jpg
```

Claude 会自动：
1. 读取 HTML 文件
2. 转换格式
3. 上传封面图
4. 创建草稿
5. 返回草稿 ID

## 使用场景

### 场景 1: 发布已有 HTML 文件
```
用户: 把 my-article.html 发到公众号
      标题是"技术分享"
      封面用 tech.jpg
```

### 场景 2: 发布 Claude 生成的 HTML
```
用户: 把刚才生成的 HTML 发布到公众号
      标题：AI 发展趋势
      作者：张三
      封面：ai-cover.png
```

### 场景 3: 完整参数
```
用户: 发布文章
      - HTML: article.html
      - 标题: 我的文章
      - 作者: 李四
      - 摘要: 这是摘要
      - 封面: cover.jpg
      - 原文: https://example.com
```

## 技术细节

- **脚本位置**: `~/.claude/skills/html-to-wechat-draft/html-to-wechat-draft.js`
- **依赖**: axios, form-data, dotenv
- **API**: 微信公众号官方 API

## 注意事项

1. **封面图片要求**
   - 格式：JPG 或 PNG
   - 大小：不超过 64KB
   - 建议尺寸：900x500 像素

2. **草稿箱限制**
   - 最多保存 100 篇草稿
   - 草稿不会自动发布

3. **凭证安全**
   - 不要将 .env 文件提交到 git
   - 建议添加到 .gitignore

## 故障排除

### 错误：获取 Access Token 失败
- 检查 AppID 和 AppSecret 是否正确
- 确认公众号类型支持该 API

### 错误：封面图片上传失败
- 检查图片大小是否超过 64KB
- 确认图片格式为 JPG 或 PNG

### 错误：创建草稿失败
- 检查草稿箱是否已满（最多 100 篇）
- 查看错误信息中的详细说明

## 与其他 Skills 的关系

- **独立使用**: 快速发布已有 HTML 文件
- **配合 article-to-wechat**: 作为工作流的最后一步
- **与 wechat-publisher 的区别**:
  - 本 skill 不需要 MCP Server
  - 更轻量，适合快速发布
  - wechat-publisher 功能更完整（支持发布、预览等）
