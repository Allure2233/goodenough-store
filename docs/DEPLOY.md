# 古德因纳夫商城部署说明

## 环境要求

- Node.js 18+
- npm 9+
- PostgreSQL 14+
- Windows、Linux 或 macOS

商城前台可脱离数据库运行；Express API 必须连接 PostgreSQL。

## 本地 Docker 部署

项目自带 `compose.yaml`，仅运行 PostgreSQL：

```powershell
docker compose up -d postgres
Copy-Item .env.example .env
npm install
npm run seed
npm run dev
```

服务地址：

| 服务 | 地址 |
| --- | --- |
| 商城前台 | `http://localhost:8080` |
| Express API | `http://localhost:3000` |
| 健康检查 | `http://localhost:3000/api/health` |
| PostgreSQL | `localhost:5432` |

停止服务：

```powershell
docker compose stop postgres
```

删除数据库容器但保留数据：

```powershell
docker compose down
```

连同数据库数据一起删除：

```powershell
docker compose down -v
```

## 本地 PostgreSQL 部署

使用已安装的 PostgreSQL 时，先创建用户和数据库：

```sql
CREATE USER goodenough_app WITH PASSWORD 'replace-this-password';
CREATE DATABASE goodenough OWNER goodenough_app;
```

复制环境变量模板并修改：

```powershell
Copy-Item .env.example .env
```

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://goodenough_app:replace-this-password@localhost:5432/goodenough
PGSSL=false
PGPOOL_MAX=10
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:8080
```

启动 API 时会自动执行 `server/db/schema.sql`，只创建缺失的表和索引。

首次需要演示数据时执行：

```powershell
npm run seed
```

`seed` 会清空所有商城业务表，不得在已有生产数据的数据库中执行。

## Linux 生产部署

以下示例基于 Ubuntu 22.04/24.04。

### 安装运行环境

```bash
sudo apt update
sudo apt install -y nodejs npm postgresql nginx
sudo npm install -g pm2
```

### 创建数据库

```bash
sudo -u postgres psql
```

```sql
CREATE USER goodenough_app WITH PASSWORD 'replace-this-password';
CREATE DATABASE goodenough OWNER goodenough_app;
\q
```

### 安装应用

```bash
sudo mkdir -p /var/www/goodenough
sudo chown -R "$USER":"$USER" /var/www/goodenough
cd /var/www/goodenough
git clone <repository-url> .
npm install --omit=dev
cp .env.example .env
```

生产 `.env` 示例：

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://goodenough_app:replace-this-password@127.0.0.1:5432/goodenough
PGSSL=false
PGPOOL_MAX=20
JWT_SECRET=replace-with-at-least-32-random-characters
JWT_EXPIRES_IN=7d
CLIENT_URL=https://example.com
```

数据库密码包含 `@`、`:`、`/` 等字符时，必须先进行 URL 编码。

### 启动 API

```bash
pm2 start server/server.js --name goodenough-api
pm2 save
pm2 startup
```

检查：

```bash
pm2 logs goodenough-api
curl http://127.0.0.1:3000/api/health
```

### 配置 Nginx

```nginx
server {
    listen 80;
    server_name example.com;

    root /var/www/goodenough/public;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location ~* \.(css|js|png|jpg|jpeg|webp|gif|ico)$ {
        expires 7d;
        add_header Cache-Control "public";
    }
}
```

启用站点：

```bash
sudo ln -s /etc/nginx/sites-available/goodenough \
  /etc/nginx/sites-enabled/goodenough
sudo nginx -t
sudo systemctl reload nginx
```

使用 Certbot 配置 HTTPS：

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d example.com
```

## 托管 PostgreSQL

将服务商提供的连接串写入 `DATABASE_URL`。如果服务要求 TLS：

```env
PGSSL=true
```

生产建议：

- 数据库只允许应用服务器网络访问。
- 为应用创建独立的非超级用户。
- 使用平台密钥管理存储 `DATABASE_URL` 和 `JWT_SECRET`。
- 配置自动备份和时间点恢复。
- 根据连接数上限调整 `PGPOOL_MAX`。

## 备份与恢复

备份：

```bash
pg_dump --format=custom \
  --dbname="$DATABASE_URL" \
  --file=goodenough-$(date +%Y%m%d).dump
```

恢复到空数据库：

```bash
pg_restore \
  --clean \
  --if-exists \
  --no-owner \
  --dbname="$DATABASE_URL" \
  goodenough-20260823.dump
```

执行恢复前应停止 API 写入并确认备份文件可用。

## 故障排查

### 连接被拒绝

确认 PostgreSQL 正在监听：

```bash
pg_isready -h 127.0.0.1 -p 5432
```

### 数据库不存在

错误包含 `database "goodenough" does not exist` 时，创建数据库或启动项目 Compose 服务。

### 密码认证失败

确认 `DATABASE_URL` 的用户、密码和数据库名称正确，并检查特殊字符是否已 URL 编码。

### Schema 权限不足

应用首次启动需要在目标数据库中创建表和索引。确认应用用户拥有目标 Schema 的 `CREATE` 权限。

### API 健康检查返回 503

检查：

```bash
pm2 logs goodenough-api
psql "$DATABASE_URL" -c "SELECT NOW();"
```

## 发布检查

1. 设置生产 `DATABASE_URL` 和强随机 `JWT_SECRET`。
2. 确认没有执行演示 `seed`。
3. 执行 `npm test`。
4. 验证 `/api/health` 返回 PostgreSQL `connected`。
5. 验证注册、登录、购物车和下单事务。
6. 配置 HTTPS、数据库备份和日志轮转。
