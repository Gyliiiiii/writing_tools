#!/usr/bin/env node

/**
 * HTML 转微信公众号草稿工具
 * 将 HTML 文件转换并上传到微信公众号草稿箱
 *
 * 使用方法:
 * node html-to-wechat-draft.js <html-file-path> [options]
 *
 * 选项:
 * --title <title>        文章标题（必需）
 * --author <author>      作者名称（可选）
 * --digest <digest>      摘要（可选）
 * --thumb <thumb-path>   封面图片路径（可选）
 * --app-id <appId>       微信公众号 AppID（必需）
 * --app-secret <secret>  微信公众号 AppSecret（必需）
 */

import fs from 'fs';
import path from 'path';
import axios from 'axios';
import FormData from 'form-data';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

// 加载 .env 文件
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class WechatDraftUploader {
  constructor(appId, appSecret) {
    this.appId = appId;
    this.appSecret = appSecret;
    this.accessToken = null;
  }

  /**
   * 获取 Access Token
   */
  async getAccessToken() {
    if (this.accessToken) {
      return this.accessToken;
    }

    try {
      const response = await axios.get(
        `https://api.weixin.qq.com/cgi-bin/token`,
        {
          params: {
            grant_type: 'client_credential',
            appid: this.appId,
            secret: this.appSecret
          }
        }
      );

      if (response.data.access_token) {
        this.accessToken = response.data.access_token;
        console.log('✅ Access Token 获取成功');
        return this.accessToken;
      } else {
        throw new Error(`获取 Access Token 失败: ${JSON.stringify(response.data)}`);
      }
    } catch (error) {
      throw new Error(`获取 Access Token 失败: ${error.message}`);
    }
  }

  /**
   * 上传封面图片
   */
  async uploadThumbMedia(thumbPath) {
    if (!thumbPath || !fs.existsSync(thumbPath)) {
      console.log('⚠️  未提供封面图片或文件不存在，将使用默认封面');
      return null;
    }

    try {
      const token = await this.getAccessToken();
      const formData = new FormData();
      formData.append('media', fs.createReadStream(thumbPath));

      const response = await axios.post(
        `https://api.weixin.qq.com/cgi-bin/material/add_material`,
        formData,
        {
          params: {
            access_token: token,
            type: 'thumb'
          },
          headers: formData.getHeaders()
        }
      );

      if (response.data.media_id) {
        console.log('✅ 封面图片上传成功:', response.data.media_id);
        return response.data.media_id;
      } else {
        console.error('❌ 封面图片上传失败:', response.data);
        return null;
      }
    } catch (error) {
      console.error('❌ 封面图片上传失败:', error.message);
      return null;
    }
  }

  /**
   * 将 HTML 转换为微信公众号支持的格式
   */
  convertHtmlToWechatFormat(htmlContent) {
    // 移除 HTML 文档结构，只保留 body 内容
    let content = htmlContent;

    // 提取 body 内容
    const bodyMatch = content.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    if (bodyMatch) {
      content = bodyMatch[1];
    }

    // 移除 container div，保留内部内容
    content = content.replace(/<div[^>]*class="container"[^>]*>([\s\S]*)<\/div>/i, '$1');

    // 清理多余的空白
    content = content.trim();

    return content;
  }

  /**
   * 创建草稿
   */
  async createDraft(article) {
    try {
      const token = await this.getAccessToken();

      const draftData = {
        articles: [article]
      };

      console.log('📤 发送的草稿数据:', JSON.stringify(draftData, null, 2));

      const response = await axios.post(
        `https://api.weixin.qq.com/cgi-bin/draft/add`,
        draftData,
        {
          params: {
            access_token: token
          }
        }
      );

      if (response.data.media_id) {
        console.log('✅ 草稿创建成功!');
        console.log('📝 Media ID:', response.data.media_id);
        return response.data;
      } else {
        throw new Error(`创建草稿失败: ${JSON.stringify(response.data)}`);
      }
    } catch (error) {
      throw new Error(`创建草稿失败: ${error.message}`);
    }
  }

  /**
   * 上传 HTML 文件到草稿箱
   */
  async uploadHtmlToDraft(htmlPath, options) {
    console.log('🚀 开始上传 HTML 到微信公众号草稿箱...\n');

    // 读取 HTML 文件
    if (!fs.existsSync(htmlPath)) {
      throw new Error(`HTML 文件不存在: ${htmlPath}`);
    }

    const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
    console.log('✅ HTML 文件读取成功');

    // 转换 HTML 格式
    const content = this.convertHtmlToWechatFormat(htmlContent);
    console.log('✅ HTML 格式转换完成');

    // 上传封面图片
    let thumbMediaId = null;
    if (options.thumb) {
      thumbMediaId = await this.uploadThumbMedia(options.thumb);
    }

    // 构建文章数据
    const article = {
      title: options.title,
      author: options.author || '',
      digest: options.digest || '',
      content: content,
      content_source_url: options.sourceUrl || '',
      need_open_comment: 0,
      only_fans_can_comment: 0
    };

    // 只有在有封面图片时才添加 thumb_media_id
    if (thumbMediaId) {
      article.thumb_media_id = thumbMediaId;
    }

    // 创建草稿
    const result = await this.createDraft(article);

    console.log('\n🎉 上传完成！');
    console.log('请登录微信公众平台查看草稿箱');

    return result;
  }
}

/**
 * 解析命令行参数
 */
function parseArgs() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
HTML 转微信公众号草稿工具

使用方法:
  node html-to-wechat-draft.js <html-file-path> [options]

必需参数:
  <html-file-path>           HTML 文件路径
  --title <title>            文章标题

可选参数:
  --author <author>          作者名称
  --digest <digest>          文章摘要
  --thumb <thumb-path>       封面图片路径
  --source-url <url>         原文链接
  --app-id <appId>           微信公众号 AppID（可从 .env 读取）
  --app-secret <secret>      微信公众号 AppSecret（可从 .env 读取）

环境变量（.env 文件）:
  WECHAT_APP_ID              微信公众号 AppID
  WECHAT_APP_SECRET          微信公众号 AppSecret
  DEFAULT_AUTHOR             默认作者名称
  DEFAULT_SOURCE_URL         默认原文链接

示例:
  node html-to-wechat-draft.js article.html \\
    --title "我的文章标题" \\
    --author "作者名" \\
    --digest "这是文章摘要" \\
    --thumb cover.jpg
    `);
    process.exit(0);
  }

  const options = {
    htmlPath: args[0],
    title: null,
    author: process.env.DEFAULT_AUTHOR || '',
    digest: '',
    thumb: null,
    sourceUrl: process.env.DEFAULT_SOURCE_URL || '',
    appId: process.env.WECHAT_APP_ID || null,
    appSecret: process.env.WECHAT_APP_SECRET || null
  };

  for (let i = 1; i < args.length; i += 2) {
    const key = args[i];
    const value = args[i + 1];

    switch (key) {
      case '--title':
        options.title = value;
        break;
      case '--author':
        options.author = value;
        break;
      case '--digest':
        options.digest = value;
        break;
      case '--thumb':
        options.thumb = value;
        break;
      case '--source-url':
        options.sourceUrl = value;
        break;
      case '--app-id':
        options.appId = value;
        break;
      case '--app-secret':
        options.appSecret = value;
        break;
    }
  }

  return options;
}

/**
 * 主函数
 */
async function main() {
  try {
    const options = parseArgs();

    // 验证必需参数
    if (!options.htmlPath) {
      console.error('❌ 错误: 请提供 HTML 文件路径');
      process.exit(1);
    }

    if (!options.title) {
      console.error('❌ 错误: 请提供文章标题 (--title)');
      process.exit(1);
    }

    if (!options.appId) {
      console.error('❌ 错误: 请提供微信公众号 AppID (--app-id)');
      process.exit(1);
    }

    if (!options.appSecret) {
      console.error('❌ 错误: 请提供微信公众号 AppSecret (--app-secret)');
      process.exit(1);
    }

    // 创建上传器实例
    const uploader = new WechatDraftUploader(options.appId, options.appSecret);

    // 上传到草稿箱
    await uploader.uploadHtmlToDraft(options.htmlPath, options);

  } catch (error) {
    console.error('\n❌ 错误:', error.message);
    process.exit(1);
  }
}

// 运行主函数
main();
