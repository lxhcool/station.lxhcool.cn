# Station (柔光玻璃起始页与新标签页)

> 类似 mTab、GoTab 体验的高颜值浏览器首页与起始页。采用液态柔光玻璃（Liquid Glass）视觉系统，支持免登录多端云同步、壁纸高斯模糊调谐、多引擎聚合搜索、快捷书签智能嗅探与轻量管理后台，兼具 Web 独立部署与 Chrome / Edge 扩展插件双形态。

---

## ✨ 核心特性

- 💎 **Liquid Glass 柔光玻璃美学**：
  - 基于 iOS / visionOS 质感打造的液态玻璃材质（镜面反光、高斯模糊、微发光与柔和阴影）。
  - **克制与辨识度平衡**：搜索框、卡片容器与小组件采用高透明度毛玻璃；文字阅读区与高频输入区具备高对比度防眩晕保护，杜绝"看不清字"的问题。
- 🖼️ **全功能壁纸引擎（Wallpaper Engine）**：
  - **精选图库**：自然风景、极简主义、赛博朋克、抽象艺术分类。
  - **必应每日一图**：自动每日抓取同步 Bing 高清壁纸。
  - **自定义图源**：支持本地图片上传（上限 10MB）与网络图片 URL 直链。
  - **实时视觉调谐**：0~30px 高斯模糊滑块、0%~80% 背景遮罩暗度调节、亮度补偿。
- 🔍 **多引擎聚合搜索**：
  - 预置 **Google、百度、Bing、Bilibili、GitHub、知乎** 一键无缝切换。
  - 智能网址自动判定，支持在新标签页或当前页打开。
- 🔖 **智能快捷书签（Bookmarks & Dock）**：
  - 输入网址**一键自动提取网页标题与高清 Favicon** 图标。
  - 支持**网格布局**与苹果风**底部悬浮 Dock 栏**切换。
  - 书签分组分类、右键/悬浮编辑与删除。
- 🧩 **小组件生态（Widgets）**：
  - **动态大时钟**：数字时钟与极简时钟、12/24小时制、秒针、根据时段呈现贴心问候。
  - **实时天气**：基于 Open-Meteo 无需 Key，自动解析气温、天气状况、湿度与风速，支持城市切换。
  - **随手便签**：右下角常驻轻量灵感便签，随写随存。
  - **每日一言**：精选金句诗词，一键点击刷新。
- ☁️ **免登录多端云同步 + 后端管理**：
  - 客户端自动生成设备唯一同步秘钥（Sync Token），无感实时推送到服务端 SQLite。
  - 跨设备只需输入 Token 即可一键恢复完整配置。
  - 支持 JSON 配置本地导出与导入备份。
  - 配备服务端管理面板（查看活跃同步设备、添加官方壁纸、管理推荐站点导航）。
- 🔌 **浏览器扩展支持（Chrome / Edge Extension）**：
  - 符合 Manifest V3 规范，一键打包覆盖 `newtab`。

---

## 🚀 快速启动

### 1. 安装依赖
```bash
pnpm install
```

### 2. 启动本地全栈开发环境 (前端 5173 + 后端 3001)
```bash
pnpm dev
```
- 前端访问：[http://localhost:5173](http://localhost:5173)
- 后端接口：[http://localhost:3001/api/health](http://localhost:3001/api/health)

---

## 📦 打包与部署

### Web 独立打包
```bash
pnpm build
```

### 浏览器扩展打包 (Chrome / Edge)
```bash
pnpm build:extension
```
打包成功后，将在 `client/dist-extension` 目录下生成完整的浏览器扩展文件。

#### 安装到浏览器步骤：
1. 打开 Chrome 访问 `chrome://extensions/`（Edge 访问 `edge://extensions/`）。
2. 打开页面右上角的 **开发者模式** (Developer mode)。
3. 点击 **加载已解压的扩展程序** (Load unpacked)。
4. 选择本项目中的 `client/dist-extension` 目录。
5. 打开一个新的标签页，即可看到 Station 柔光玻璃起始页！

---

## 🛠️ 项目目录结构

```
station.lxhcoool.cn/
├── client/                     # 前端工程 (Vite + React + Tailwind + Framer Motion)
│   ├── public/
│   │   ├── manifest.json       # Chrome 插件 Manifest V3 清单
│   │   └── favicon.svg         # 矢量站点与插件图标
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/          # 后台管理组件
│   │   │   ├── bookmarks/      # 书签卡片、网格、Dock、添加弹窗
│   │   │   ├── search/         # 聚合搜索与引擎切换
│   │   │   ├── settings/       # 设置、多端同步密钥、备份导入导出
│   │   │   ├── ui/             # Liquid Glass 基础组件库 (Card, Modal, Button, Slider, Input)
│   │   │   ├── wallpaper/      # 壁纸渲染层与视觉调谐弹窗
│   │   │   └── widgets/        # 时钟、天气、随手便签、每日一言
│   │   ├── hooks/              # usePreferences 同步状态钩子
│   │   ├── services/           # REST API 客户端
│   │   ├── styles/             # Liquid glass 特效与 Tailwind 样式
│   │   └── types/              # TypeScript 类型定义
│   └── dist-extension/         # 浏览器扩展打包生成物
├── server/                     # 后端服务 (Express + Better-SQLite3)
│   ├── data/                   # SQLite 数据库存储 (station.db)
│   ├── uploads/                # 用户自定义上传壁纸目录
│   └── src/
│       ├── db/                 # 数据库初始化与预置数据种子
│       ├── routes/             # sync, wallpapers, tools(metadata/upload), admin
│       └── server.ts           # 服务主入口 (端口 3001)
└── package.json
```
