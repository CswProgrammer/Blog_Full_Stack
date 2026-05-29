# 博客系统

个人博客与项目作品集系统，前端使用 Next.js + React，后端使用 Node.js + Fastify，数据层使用 MySQL + Redis。

## 本地启动

1. 复制环境变量：

```bash
cp .env.example .env
```

2. 安装依赖：

```bash
npm install
```

3. 启动 MySQL 和 Redis：

```bash
docker compose up -d mysql redis
```

默认本机端口：

- MySQL：`127.0.0.1:13306`
- Redis：`127.0.0.1:16379`

4. 启动前后端开发服务：

```bash
npm run dev
```

访问：

- 前台：http://localhost:3000/zh
- API：http://localhost:4000/api/health
- 后台登录：http://localhost:3000/zh/admin/login

首次登录会自动创建管理员，默认账号密码来自 `.env`：

- 用户名：`admin`
- 密码：`admin123456`

## Docker 一键启动

```bash
cp .env.example .env
docker compose up -d --build
```

## 生产部署

推送 `main` 分支会自动触发 GitHub Actions 部署到服务器。

- 线上地址：http://82.156.149.118/zh
- 部署目录：`/opt/blog`

## 目录

```text
apps/web       Next.js 前台与后台页面
apps/api       Fastify API 服务
deploy/mysql   MySQL 初始化 SQL
uploads         本地上传目录
```
