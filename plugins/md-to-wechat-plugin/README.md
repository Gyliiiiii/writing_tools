# Markdown 转微信公众号 Plugin

将 Markdown 文件转换为 HTML 并发布到微信公众号草稿箱的 Claude Code Plugin。

## 功能特点

- ✅ Markdown 自动转换为微信适配的 HTML
- ✅ 内联样式，完美适配微信公众号
- ✅ 直接调用微信 API，无需 MCP Server
- ✅ 首次使用引导配置，提供 IP 白名单提示
- ✅ 支持上传封面图片

## 安装

### 方法 1: 从源码安装

1. 克隆或下载此 plugin 到本地
2. 进入 plugin 目录
3. 安装依赖：

```bash
cd md-to-wechat-plugin/skills/md-to-wechat
npm install
```

4. 将 plugin 复制到 Claude Code 的 plugins 目录：

```bash
cp -r md-to-wechat-plugin ~/.claude/plugins/
```

### 方法 2: 直接使用

如果你已经有编译好的 plugin 包，直接放到 `~/.claude/plugins/` 目录即可。

## 首次配置

首次使用时，Claude 会引导你完成配置：

1. **获取公网 IP**：Claude 会自动获取你的公网 IP 地址
2. **配置白名单**：需要在微信公众平台添加 IP 白名单
3. **提供凭证**：输入 AppID 和 AppSecret
4. **保存配置**：配置会保存到 `.env` 文件


## 使用方法

### 基本用法

在 Claude Code 中，直接告诉 Claude：

```
把 article.md 发布到微信公众号
封面图：cover.jpg
```

Claude 会自动：
1. 检查配置（首次使用会引导配置）
2. 转换 Markdown 为 HTML
3. 上传封面图片
4. 创建草稿
5. 返回 Media ID

### 完整参数

```
发布 Markdown 到公众号
- 文件：tech-article.md
- 标题：AI 技术分享
- 作者：张三
- 摘要：这是一篇关于 AI 的技术文章
- 封面：tech-cover.png
```

## 配置说明

### 获取微信公众号凭证

1. 登录 [微信公众平台](https://mp.weixin.qq.com/)
2. 进入「开发」→「基本配置」
3. 获取 AppID 和 AppSecret
4. 配置 IP 白名单

### 配置文件

配置会保存在 `~/.claude/plugins/md-to-wechat/skills/md-to-wechat/.env`

格式：
```bash
WECHAT_APP_ID=your_app_id
WECHAT_APP_SECRET=your_app_secret
DEFAULT_AUTHOR=你的名字
```


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


## 常见问题

### Q: 如何获取 AppID 和 AppSecret？
A: 登录微信公众平台，进入「开发」→「基本配置」即可查看。

### Q: 为什么需要配置 IP 白名单？
A: 微信 API 要求调用方的 IP 必须在白名单中，这是安全措施。

### Q: 草稿创建后在哪里查看？
A: 登录微信公众平台，进入「内容管理」→「草稿箱」。

### Q: 可以直接发布吗？
A: 目前只支持创建草稿，需要在公众平台手动发布。

## 技术架构

```
md-to-wechat-plugin/
├── plugin.json              # Plugin 配置
├── README.md               # 说明文档
└── skills/
    └── md-to-wechat/
        ├── SKILL.md        # Skill 文档
        ├── md-to-html.js   # Markdown 转 HTML
        ├── html-to-wechat-draft.js  # 发布到微信
        ├── package.json    # 依赖配置
        └── .env           # 用户配置（首次使用时创建）
```

## 许可证

MIT

