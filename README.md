# 🚗 油耗助手 - 车辆油耗记录管理系统

一款基于 Cloudflare 全栈部署的多车辆油耗记录管理系统，支持多设备同步。

## 功能特性

- 🚗 **多车辆管理** — 支持添加、编辑、删除多辆车辆
- ⛽ **加油记录** — 记录每次加油的日期、里程、油量、单价、加油站等
- 📊 **油耗统计** — 自动计算平均油耗 (L/100km)、每公里成本
- 📈 **趋势图表** — 可视化油耗变化趋势
- 💰 **费用统计** — 总花费、总加油量、总里程一目了然
- 📱 **移动端优先** — 响应式设计，适配手机浏览器
- 🔐 **用户认证** — JWT 登录注册，数据安全隔离
- ☁️ **多设备同步** — 数据存储在云端，随时随地访问

## 技术栈

- **前端**: React 19 + TypeScript + Vite
- **样式**: TailwindCSS v4
- **图表**: Recharts
- **图标**: Lucide React
- **路由**: React Router v7
- **后端**: Cloudflare Workers + Hono
- **数据库**: Cloudflare D1 (SQLite)
- **认证**: JWT (JSON Web Token)
- **部署**: Cloudflare Pages (前端) + Cloudflare Workers (API)

## 项目结构

```
├── src/                    # 前端源码
│   ├── api.ts              # API 客户端
│   ├── types.ts            # 类型定义
│   ├── utils.ts            # 工具函数
│   ├── components/         # 公共组件
│   └── pages/              # 页面组件
├── worker/                 # Cloudflare Worker 后端
│   └── index.ts            # Hono API 路由
├── wrangler.toml           # Cloudflare 配置
└── package.json
```

## 本地开发

```bash
# 安装依赖
npm install

# 启动前端开发服务器
npm run dev

# 启动 Worker 开发服务器
npm run dev:worker

# 构建生产版本
npm run build
```

## 部署

### 前端 (Cloudflare Pages)

```bash
npm run build
wrangler pages deploy dist
```

### 后端 (Cloudflare Workers)

```bash
wrangler deploy
```

## 数据说明

- ✅ 数据存储在 Cloudflare D1 云端数据库
- ✅ 支持多设备同步
- ✅ 用户数据隔离，隐私安全
- ✅ 需要注册账号登录使用

## 油耗计算原理

油耗采用「加满油箱法」计算：

1. 每次加满油箱时记录里程表读数
2. 相邻两次加满之间的里程差 = 行驶距离
3. 期间所有加油量之和 ÷ 行驶距离 × 100 = 百公里油耗
