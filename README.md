# 古德因纳夫商城

一个可直接在本地运行的响应式购物网站。商城前台使用原生 HTML、CSS 和 JavaScript，后端提供 Express、PostgreSQL 和 JWT REST API。

## 功能

- 商品分类、搜索、收藏、排序与详情
- 购物车数量调整、优惠码与结算
- 收货信息校验、订单提交与历史订单
- 浏览器本地数据持久化
- 用户注册、登录、资料与密码管理 API
- PostgreSQL 商品、收藏、购物车和订单持久化
- 管理员商品、订单和统计接口
- 桌面端与移动端响应式布局
- Windows 一键启动、关闭和进程状态管理
- **AI 购物助手**：集成 DeepSeek 大模型，SSE 流式输出，多轮对话，商品卡片推荐
- **用户注册与登录**：JWT 认证，登录/注册弹窗，个人中心管理
- **个人中心**：用户资料编辑、密码修改、订单记录查看

## 运行模式

商城首页和 API 当前相互独立：

- 前台模式：商品数据位于 `public/script.js`，购物车、收藏和订单保存在 `localStorage`。
- API 模式：数据保存在 PostgreSQL，由 Express 提供认证、商品、购物车和订单接口。

未启动 PostgreSQL 时仍可完整体验商城前台。

## 快速开始

### 环境要求

- Windows 10/11
- Node.js 18 或更高版本
- PostgreSQL 14 或更高版本，仅 API 需要
- Docker Desktop，可选，用于运行项目自带的 PostgreSQL 容器

### 一键运行

1. 双击 `一键启动商城.bat`。
2. 浏览器会自动打开 [http://localhost:8080](http://localhost:8080)。
3. 使用结束后双击 `一键关闭商城.bat`。

启动脚本会：

- 启动前端静态服务器。
- 在 `.store-runtime/processes.json` 中记录进程。
- 检查 PostgreSQL 的 `5432` 端口。
- 当 Docker daemon 已运行时，自动执行 `docker compose up -d postgres`。
- 自动安装缺失的 Node.js 依赖并启动 API。

由脚本启动的 PostgreSQL 容器会在一键关闭时停止，数据保留在 Docker Volume 中。外部 PostgreSQL 不会被停止。

如果 Docker Desktop 未运行且本机没有 PostgreSQL，脚本仅启动前台本地模式。

## PostgreSQL 配置

### Docker 方式

```powershell
docker compose up -d postgres
Copy-Item .env.example .env
npm install
npm run seed
npm run dev
```

默认连接信息：

| 配置 | 值 |
| --- | --- |
| 主机 | `localhost` |
| 端口 | `5432` |
| 数据库 | `goodenough` |
| 用户名 | `postgres` |
| 密码 | `postgres` |

### 已安装 PostgreSQL

先创建数据库：

```sql
CREATE DATABASE goodenough;
```

复制 `.env.example` 为 `.env`，然后设置实际连接地址：

```env
DATABASE_URL=postgresql://postgres:your-password@localhost:5432/goodenough
```

应用启动时会自动执行 `server/db/schema.sql`，创建缺失的数据表和索引。

## 数据初始化

```powershell
npm run seed
```

此命令会清空 PostgreSQL 中现有的商城业务数据，然后写入演示账号和商品。不要对生产数据库执行。

| 角色 | 用户名 | 密码 |
| --- | --- | --- |
| 管理员 | `admin` | `admin123` |
| 普通用户 | `test` | `test123` |

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `npm run client` | 启动前端静态服务器 |
| `npm start` | 启动 Express API |
| `npm run server` | 使用 Nodemon 启动 API |
| `npm run dev` | 同时启动前端和 API |
| `npm run seed` | 重建 PostgreSQL 演示数据 |
| `npm test` | 执行 Node.js 测试 |
| `docker compose up -d postgres` | 启动 PostgreSQL 容器 |
| `docker compose stop postgres` | 停止 PostgreSQL 容器 |

API 健康检查：[http://localhost:3000/api/health](http://localhost:3000/api/health)

查看一键脚本状态：

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\start-store.ps1 -Action Status
```

## 项目结构

```text
购物网站/
|-- public/
|   |-- index.html             商城首页
|   |-- styles.css             页面样式
|   |-- script.js              前台状态与购物流程
|   `-- admin/                 旧版管理页面
|-- server/
|   |-- db/
|   |   |-- index.js           PostgreSQL 连接池与事务
|   |   `-- schema.sql         数据表、约束与索引
|   |-- repositories/          参数化 SQL 数据访问
|   |-- routes/                REST API 路由
|   |-- middleware/            JWT 认证与权限
|   |-- utils/                 序列化、JWT 与初始化
|   |-- server.js              Express API 入口
|   `-- static-server.js       前端静态服务器
|-- scripts/start-store.ps1    启停与状态管理
|-- docs/                      架构、API 与部署文档
|-- compose.yaml               PostgreSQL 容器
|-- 一键启动商城.bat
|-- 一键关闭商城.bat
`-- package.json
```

<a id="project-architecture"></a>

## 项目架构

```mermaid
flowchart LR
    Browser[浏览器] -->|localhost:8080| Static[静态服务器]
    Static --> Frontend[HTML / CSS / JavaScript]
    Frontend --> LocalStorage[(localStorage)]
    Frontend --> ImageService[在线图片服务]

    ApiClient[API 客户端] -->|localhost:3000/api| Express[Express API]
    Express --> Middleware[JWT 与参数校验]
    Middleware --> Routes[业务路由]
    Routes --> Repositories[SQL 仓储]
    Repositories --> Pool[pg 连接池]
    Pool --> PostgreSQL[(PostgreSQL)]
```

后端通过仓储层隔离 SQL 和 API 字段转换。数据库使用 UUID 主键、外键、检查约束和索引；订单创建、扣减库存及清理购物车在同一事务中完成。

更详细的模块边界、请求流和数据关系见 [完整架构文档](./docs/ARCHITECTURE.md)。

## 配置

服务端会自动加载项目根目录的 `.env`：

| 变量 | 默认值 |
| --- | --- |
| `PORT` | `3000` |
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/goodenough` |
| `PGSSL` | `false` |
| `PGPOOL_MAX` | `10` |
| `CLIENT_URL` | `http://localhost:8080` |
| `JWT_SECRET` | 内置开发值 |
| `JWT_EXPIRES_IN` | `7d` |
| `DEEPSEEK_API_KEY` | 空（不配置则使用 Mock 模式） |
| `DEEPSEEK_MODEL` | `deepseek-chat` |

生产环境必须更换数据库密码和 `JWT_SECRET`，并根据托管数据库要求设置 `PGSSL=true`。

## 前台本地数据

| 键 | 内容 |
| --- | --- |
| `goodenough_cart_v2` | 购物车 |
| `goodenough_favorites_v2` | 收藏商品 |
| `goodenough_orders_v2` | 历史订单 |
| `goodenough_subscriber_v2` | 订阅邮箱 |

前台优惠码为 `NEW10` 和 `EDIT20`；API 优惠码为 `VIP20`、`SUMMER30` 和 `NEWUSER`。

## 故障排查

- 前台可打开但 API 未启动：确认 PostgreSQL 正在监听 `5432`，并检查 `.env` 的 `DATABASE_URL`。
- `database "goodenough" does not exist`：创建数据库，或启动 `compose.yaml` 中的数据库服务。
- `password authentication failed`：修改 `.env` 中的 PostgreSQL 用户名和密码。
- `8080` 或 `3000` 被占用：先运行一键关闭脚本，再检查占用该端口的其他程序。
- 启动失败：查看 `.store-runtime/frontend.err.log` 和 `.store-runtime/api.err.log`。
- 商品图片未显示：图片由在线服务提供，请检查网络连接。

## 相关文档

- [项目架构](./README.md#project-architecture)
- [完整架构文档](./docs/ARCHITECTURE.md)
- [API 文档](./docs/API.md)
- [部署说明](./docs/DEPLOY.md)
- [代码规范](./docs/SPEC.md)
