# 🚗 油耗助手 - 车辆油耗记录管理系统

一款基于 Cloudflare Pages 部署的多车辆油耗记录管理系统，纯前端实现，数据存储在浏览器 localStorage 中。

## 功能特性

- 🚗 **多车辆管理** — 支持添加、编辑、删除多辆车辆
- ⛽ **加油记录** — 记录每次加油的日期、里程、油量、单价、加油站等
- 📊 **油耗统计** — 自动计算平均油耗 (L/100km)、每公里成本
- 📈 **趋势图表** — 可视化油耗变化趋势
- 💰 **费用统计** — 总花费、总加油量、总里程一目了然
- 📱 **移动端优先** — 响应式设计，适配手机浏览器

## 技术栈

- **前端**: React 19 + TypeScript + Vite
- **样式**: TailwindCSS v4
- **图表**: Recharts
- **图标**: Lucide React
- **路由**: React Router v7
- **部署**: Cloudflare Pages

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 部署到 Cloudflare Pages

### 方式一：通过 Wrangler CLI

```bash
# 安装 wrangler
npm install -g wrangler

# 登录 Cloudflare
wrangler login

# 部署
wrangler pages deploy dist
```

### 方式二：通过 Cloudflare Dashboard

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Workers & Pages** → **Create application** → **Pages**
3. 连接你的 Git 仓库
4. 配置构建设置：
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. 点击 **Save and Deploy**

## 数据说明

所有数据存储在浏览器的 localStorage 中，特点：

- ✅ 无需后端服务器
- ✅ 无需注册登录
- ✅ 隐私安全（数据不离开本地）
- ⚠️ 清除浏览器数据会丢失记录
- ⚠️ 不同浏览器/设备间数据不共享

## 油耗计算原理

油耗采用「加满油箱法」计算：

1. 每次加满油箱时记录里程表读数
2. 相邻两次加满之间的里程差 = 行驶距离
3. 期间所有加油量之和 ÷ 行驶距离 × 100 = 百公里油耗

