# 🧠 思维导图 - 幕布式协作工具

一个类幕布（Mubu）的思维导图工具，支持大纲编辑、脑图可视化和实时协作。

## ✨ 功能

- 📋 **大纲模式** — 缩进式层级编辑
- 🧠 **脑图模式** — SVG 矢量树状图，支持拖拽平移和滚轮缩放
- 📐 **双栏模式** — 左大纲右脑图，自由调整分栏
- 👥 **实时协作** — 创建房间，6位邀请码加入，多人同步编辑
- ⌨️ **全键盘操作** — Tab/Shift+Tab/Enter/Ctrl+Z/Y
- 🎨 **8色节点标记** — 不同分支不同颜色
- 📥 **多格式导出** — PNG / SVG / Markdown / 文本 / JSON / HTML
- 🌓 **暗色模式** — 夜间友好
- 💾 **自动保存** — localStorage 本地持久化

## 🚀 快速开始

### 网页版（个人使用）
直接访问：**https://samuelwong85277.github.io/mindmap/**

所有功能正常使用，数据保存在浏览器本地。

### 本地版（含协作功能）
```bash
git clone https://github.com/samuelwong85277/mindmap.git
cd mindmap
npm install
npm start
# 打开 http://localhost:3456
```

协作功能需要本地服务端支持 WebSocket。

## ⌨️ 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Tab` | 缩进（变子节点） |
| `Shift+Tab` | 提升（变同级） |
| `Enter` | 新建同级节点 |
| `Shift+Enter` | 新建子节点 |
| `Backspace` | 删除空节点 |
| `Ctrl+Z` | 撤销 |
| `Ctrl+Y` | 重做 |
| `Ctrl+K` | 插入超链接 |
| `Ctrl+S` | 保存 |

## 🏠 本地服务端

服务端使用 Node.js + Express + WebSocket：

```bash
# 安装依赖
npm install

# 启动服务 (默认端口 3456)
npm start

# 自定义端口
PORT=8080 npm start
```

数据存储在 `data/` 目录，每个房间一个JSON文件。

## 📄 开源协议

MIT
