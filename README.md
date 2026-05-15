# 具身机器人技术交流平台

## 本地开发

需要 Node.js 18+ 和 PostgreSQL。

1. 克隆项目，安装依赖：`npm install`
2. 复制环境变量：在 `.env.local` 中设置 `DATABASE_URL`、`AUTH_SECRET`、`AUTH_URL`
3. 运行数据库迁移：`npx prisma migrate dev`
4. 填充初始数据：`npx prisma db seed`
5. 启动开发服务器：`npm run dev`

默认账号：
- BD 管理员：`bd@company.com` / `admin123`
- 研发人员：`rd@company.com` / `admin123`

## 部署到 Railway

1. 在 Railway 创建项目，添加 PostgreSQL 数据库
2. 设置环境变量：
   - `DATABASE_URL`：Railway 自动提供
   - `AUTH_SECRET`：运行 `openssl rand -base64 32` 生成
   - `AUTH_URL`：你的 Railway 应用 URL（如 `https://your-app.railway.app`）
3. 推送代码，Railway 自动部署
4. 首次部署后运行：`railway run npx prisma db seed`
