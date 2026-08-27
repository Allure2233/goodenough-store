# 古德因纳夫商城项目说明

## 项目定位

古德因纳夫商城是一个用于展示电商交互和 REST API 设计的本地项目，包含：

- 原生 HTML、CSS、JavaScript 商城前台
- Node.js 静态文件服务器
- Express REST API
- PostgreSQL 业务数据库
- JWT 用户认证和管理员授权
- Windows 一键启停脚本

当前商城前台使用浏览器本地数据，尚未调用 REST API。前台与 API 可以独立运行。

## 技术栈

| 层级 | 技术 |
| --- | --- |
| 前端 | HTML5、CSS3、JavaScript ES6+ |
| 静态服务 | Node.js HTTP |
| API | Node.js 18+、Express |
| 数据库 | PostgreSQL 14+ |
| 数据访问 | `pg` 连接池、参数化 SQL |
| 认证 | JWT、bcrypt |
| 本地编排 | PowerShell、Docker Compose |

## 功能模块

### 商城前台

- 商品筛选、搜索和排序
- 商品详情与收藏
- 购物车、优惠码和结算
- 本地订单历史
- 桌面端与移动端布局

数据保存在浏览器 `localStorage`，不需要数据库。

### 用户 API

- 注册与登录
- 获取和修改个人资料
- 修改密码
- 收藏商品
- JWT 身份认证

### 商品 API

- 商品分页、筛选和排序
- 关键词搜索
- 推荐商品
- 管理员新增、更新与软删除

### 购物车 API

- 添加、修改和删除条目
- 全选与单项选择
- 库存数量检查
- 优惠码验证

### 订单 API

- 创建与查询订单
- 取消订单并恢复库存
- 确认收货
- 管理员状态管理与统计
- PostgreSQL 事务和商品行锁

## PostgreSQL 数据设计

| 表 | 职责 |
| --- | --- |
| `users` | 用户资料、密码哈希、角色和状态 |
| `products` | 商品、价格、库存、图片和规格 |
| `user_favorites` | 用户与收藏商品的多对多关系 |
| `carts` | 每个用户的购物车 |
| `cart_items` | 购物车商品、数量和选择状态 |
| `orders` | 订单金额、状态、地址和支付信息 |
| `order_items` | 下单时的商品名称、价格和图片快照 |

所有主键使用 UUID。外键、唯一约束、检查约束和查询索引定义在 `server/db/schema.sql`。

下单事务执行：

1. 锁定选中商品记录。
2. 校验商品状态和库存。
3. 创建订单与订单条目。
4. 扣减库存并增加销量。
5. 删除已结算的购物车条目。
6. 提交事务；任一步失败则全部回滚。

## 目录结构

```text
public/                  商城静态资源
server/
|-- db/                  PostgreSQL 连接池与 Schema
|-- middleware/          JWT 认证和管理员权限
|-- repositories/        SQL 查询、序列化和事务
|-- routes/              HTTP 路由与参数处理
|-- utils/               JWT、序列化和演示数据
|-- server.js            API 入口
`-- static-server.js     前端静态服务
scripts/                 一键启停实现
docs/                    项目文档
compose.yaml             PostgreSQL 容器配置
```

完整设计见 [ARCHITECTURE.md](./ARCHITECTURE.md)。

## 本地运行

### 只运行前台

```powershell
npm install
npm run client
```

访问 `http://localhost:8080`。

### 运行 PostgreSQL API

```powershell
docker compose up -d postgres
Copy-Item .env.example .env
npm install
npm run seed
npm start
```

健康检查地址为 `http://localhost:3000/api/health`。

应用启动时会自动创建缺失的数据表；`npm run seed` 会清空业务表并写入演示数据。

## 演示账号

| 角色 | 用户名 | 密码 |
| --- | --- | --- |
| 管理员 | `admin` | `admin123` |
| 普通用户 | `test` | `test123` |

演示账号仅在执行 `npm run seed` 后存在。

## 环境变量

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/goodenough
PGSSL=false
PGPOOL_MAX=10
JWT_SECRET=replace-with-a-secure-secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:8080
```

项目会自动读取根目录 `.env`。生产环境不得使用示例密码和默认 JWT 密钥。

## 当前边界

- 商城首页与 API 尚未接通，两端商品和优惠码分别维护。
- `public/admin/` 是旧版页面，静态服务器当前不代理 `/api`。
- 支付仅为状态模拟，没有连接真实支付平台。
- 商品图片依赖在线服务。
- 生产环境仍需补充限流、审计日志和 PostgreSQL 集成测试。
