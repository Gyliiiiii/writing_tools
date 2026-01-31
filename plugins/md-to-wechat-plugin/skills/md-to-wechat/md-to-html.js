#!/usr/bin/env node

import { marked } from 'marked';
import fs from 'fs';

// 微信公众号样式配置
const styles = {
  body: 'margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;',
  h1: 'font-size: 22px; font-weight: bold; margin: 20px 0 15px; color: #1a1a1a; line-height: 1.4;',
  h2: 'font-size: 20px; font-weight: bold; margin: 25px 0 15px; color: #2c2c2c; border-left: 4px solid #1890ff; padding-left: 12px;',
  h3: 'font-size: 18px; font-weight: bold; margin: 20px 0 12px; color: #333;',
  p: 'font-size: 16px; line-height: 1.8; color: #333; margin: 12px 0; text-align: justify;',
  strong: 'font-weight: bold; color: #1a1a1a;',
  code: 'background-color: #f5f5f5; padding: 2px 6px; border-radius: 3px; font-family: monospace; color: #d73a49;',
  pre: 'background-color: #f6f8fa; padding: 16px; border-radius: 6px; overflow-x: auto; margin: 16px 0;',
  blockquote: 'border-left: 4px solid #1890ff; padding: 12px 16px; margin: 20px 0; color: #666; background: #f9f9f9;',
  li: 'font-size: 16px; line-height: 1.8; color: #333; margin: 8px 0 8px 20px;',
  table: 'width: 100%; border-collapse: collapse; margin: 20px 0;',
  th: 'border: 1px solid #ddd; padding: 12px 8px; background-color: #f5f5f5; font-weight: bold;',
  td: 'border: 1px solid #ddd; padding: 12px 8px;',
  hr: 'border-top: 1px solid #eee; margin: 25px 0;',
  a: 'color: #1890ff; text-decoration: none;',
  img: 'max-width: 100%; height: auto; display: block; margin: 20px auto;'
};

// 转换函数 - 使用简单的方式
function convertMdToHtml(markdown, title = '') {
  // 先用 marked 转换
  let html = marked.parse(markdown);

  // 然后添加内联样式
  html = html
    .replace(/<h1>/g, `<h1 style="${styles.h1}">`)
    .replace(/<h2>/g, `<h2 style="${styles.h2}">`)
    .replace(/<h3>/g, `<h3 style="${styles.h3}">`)
    .replace(/<p>/g, `<p style="${styles.p}">`)
    .replace(/<strong>/g, `<strong style="${styles.strong}">`)
    .replace(/<code>/g, `<code style="${styles.code}">`)
    .replace(/<pre><code/g, `<pre style="${styles.pre}"><code`)
    .replace(/<blockquote>/g, `<blockquote style="${styles.blockquote}">`)
    .replace(/<a /g, `<a style="${styles.a}" `)
    .replace(/<img /g, `<img style="${styles.img}" `)
    .replace(/<table>/g, `<table style="${styles.table}">`)
    .replace(/<th>/g, `<th style="${styles.th}">`)
    .replace(/<td>/g, `<td style="${styles.td}">`)
    .replace(/<hr>/g, `<p style="${styles.hr}"></p>`)
    .replace(/<ul>/g, '')
    .replace(/<\/ul>/g, '')
    .replace(/<ol>/g, '')
    .replace(/<\/ol>/g, '')
    .replace(/<li>/g, `<p style="${styles.li}">• `)
    .replace(/<\/li>/g, '</p>');

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
</head>
<body style="${styles.body}">
${html}
</body>
</html>`;
}

// 命令行调用
if (process.argv.length < 4) {
  console.error('用法: node md-to-html.js <markdown-file> <output-html>');
  process.exit(1);
}

const mdFile = process.argv[2];
const htmlFile = process.argv[3];

try {
  const markdown = fs.readFileSync(mdFile, 'utf-8');
  const titleMatch = markdown.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : '微信公众号文章';

  const html = convertMdToHtml(markdown, title);
  fs.writeFileSync(htmlFile, html, 'utf-8');

  console.log('✅ 转换成功！');
  console.log(`📄 输出: ${htmlFile}`);
} catch (error) {
  console.error(`❌ 错误: ${error.message}`);
  process.exit(1);
}
