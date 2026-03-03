<p align="center">
  <img src="icon.svg" width="100" height="100" alt="AiMsgExport Icon"/>
</p>

<h1 align="center">AiMsgExport</h1>

<p align="center">
  <strong>一键导出 AI 对话记录为 PDF / 长图 / Markdown / 纯文本</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-0.1.0-blue" alt="version"/>
  <img src="https://img.shields.io/badge/license-MIT-green" alt="license"/>
  <img src="https://img.shields.io/badge/platforms-11-orange" alt="platforms"/>
  <img src="https://img.shields.io/badge/tampermonkey-compatible-brightgreen" alt="tampermonkey"/>
</p>

---

## 功能特性

- **多平台支持** — 覆盖 11 个主流 AI 对话平台，统一的导出体验
- **4 种导出格式** — PDF 文档、全长截图（PNG）、Markdown、纯文本
- **灵活消息选择** — 逐条勾选、范围选择、一键全选
- **原生侧边栏集成** — 自动嵌入各平台侧边栏，零违和感
- **可拖拽浮窗面板** — 不遮挡对话内容，随意拖动放置
- **CSS 隔离导出** — 导出内容独立于宿主页面样式，排版整洁不变形

## 支持平台

| 平台 | 域名 |
|:---|:---|
| ChatGPT | `chatgpt.com` |
| Google Gemini | `gemini.google.com` |
| Claude | `claude.ai` |
| Grok | `grok.com` |
| DeepSeek | `chat.deepseek.com` |
| 豆包 | `www.doubao.com` |
| 通义千问 | `chat.qwen.ai` |
| Google AI Studio | `aistudio.google.com` |
| Microsoft Copilot | `copilot.cloud.microsoft` |
| Microsoft 365 Copilot | `m365.cloud.microsoft` |
| Perplexity | `www.perplexity.ai` |

## 安装

### 前置要求

安装以下任一用户脚本管理器：

- [Tampermonkey](https://www.tampermonkey.net/)（推荐）
- [Violentmonkey](https://violentmonkey.github.io/)
- [Greasemonkey](https://www.greasespot.net/)

### 安装脚本

1. 打开用户脚本管理器的「添加新脚本」页面
2. 将 `ai-chat-export.user.js` 的全部内容复制粘贴进去
3. 保存，刷新目标 AI 对话页面

## 使用方法

### 1. 打开导出面板

在任意支持的 AI 对话页面中，点击侧边栏中新增的 **AiMsgExport** 按钮，即可打开浮窗面板。

### 2. 选择消息

| 方式 | 说明 |
|:---|:---|
| **选择模式** | 点击「开启选择模式」后，直接点击对话消息进行勾选/取消 |
| **范围选择** | 在消息之间出现的「从这里开始」/「到这里结束」按钮设定范围，然后点击「应用范围」 |
| **全选** | 一键选中当前对话的所有消息 |

### 3. 导出

选好消息后，点击对应的导出按钮：

| 按钮 | 格式 | 说明 |
|:---|:---|:---|
| **PDF 文档** | `.pdf` | 自动分页，适合打印和归档 |
| **全长图片** | `.png` | 生成一张完整的长截图 |
| **Markdown** | `.md` | 保留标题、代码块、列表等格式 |
| **纯文本** | `.txt` | 仅提取文字内容 |

## 技术依赖

| 库 | 版本 | 用途 |
|:---|:---|:---|
| [html2canvas](https://html2canvas.hertzen.com/) | 1.4.1 | DOM 转 Canvas（图片/PDF 渲染） |
| [jsPDF](https://github.com/parallax/jsPDF) | 2.5.1 | 生成 PDF 文档 |
| [Turndown](https://github.com/mixmark-io/turndown) | 7.1.2 | HTML 转 Markdown |

所有依赖通过 `@require` 从 jsDelivr CDN 加载，无需手动安装。

## 项目结构

```
aichattopng/
├── ai-chat-export.user.js   # 用户脚本主文件
├── icon.svg                  # 脚本图标
└── README.md                 # 本文件
```

## 常见问题

**Q: 导出的图片/PDF 为什么是空白的？**

确保在导出前已通过选择模式选中了至少一条消息。面板顶部会显示当前已选消息数量。

**Q: 侧边栏按钮没有出现？**

部分平台采用 SPA 架构，侧边栏可能需要几秒加载。脚本内置了重试机制和 MutationObserver 持久监听，如果等待超过 20 秒仍未出现，请尝试刷新页面。

**Q: 支持深色模式吗？**

导出内容使用独立的浅色主题样式，无论页面是否为深色模式，导出结果始终是清晰可读的浅色排版。

## 许可证

MIT License
