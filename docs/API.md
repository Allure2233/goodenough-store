# 古德因纳夫商城 - API接口文档

> 版本: v1.1.0  
> 更新日期: 2026年8月  
> 基础URL: `http://localhost:3000/api`

资源 ID 使用 PostgreSQL UUID。

---

## 目录

1. [认证接口](#1-认证接口)
2. [商品接口](#2-商品接口)
3. [购物车接口](#3-购物车接口)
4. [订单接口](#4-订单接口)
5. [错误码说明](#5-错误码说明)

---

## 1. 认证接口

### 1.1 用户注册

**请求**

```
POST /auth/register
Content-Type: application/json
```

**参数**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| username | String | ✅ | 用户名（3-20个字符） |
| email | String | ✅ | 邮箱地址 |
| password | String | ✅ | 密码（至少6个字符） |

**请求示例**

```json
{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
}
```

**响应示例**

```json
{
    "success": true,
    "message": "注册成功",
    "data": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "user": {
            "_id": "8f3cb5d8-4ac6-4c51-b810-758bd2b11cb8",
            "username": "testuser",
            "email": "test@example.com",
            "role": "user",
            "createdAt": "2026-08-23T00:00:00.000Z"
        }
    }
}
```

---

### 1.2 用户登录

**请求**

```
POST /auth/login
Content-Type: application/json
```

**参数**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| username | String | ✅ | 用户名 |
| password | String | ✅ | 密码 |

**响应示例**

```json
{
    "success": true,
    "message": "登录成功",
    "data": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "user": {
            "_id": "8f3cb5d8-4ac6-4c51-b810-758bd2b11cb8",
            "username": "testuser",
            "email": "test@example.com",
            "role": "user"
        }
    }
}
```

---

### 1.3 获取用户信息

**请求**

```
GET /auth/profile
Authorization: Bearer <token>
```

**响应示例**

```json
{
    "success": true,
    "message": "获取成功",
    "data": {
        "_id": "8f3cb5d8-4ac6-4c51-b810-758bd2b11cb8",
        "username": "testuser",
        "email": "test@example.com",
        "phone": "138****8000",
        "avatar": "",
        "role": "user",
        "addresses": [],
        "favorites": [],
        "createdAt": "2026-08-23T00:00:00.000Z"
    }
}
```

---

### 1.4 更新用户信息

**请求**

```
PUT /auth/profile
Authorization: Bearer <token>
Content-Type: application/json
```

**参数**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| phone | String | ❌ | 手机号 |
| avatar | String | ❌ | 头像URL |

---

### 1.5 添加收藏

**请求**

```
POST /auth/favorites/:productId
Authorization: Bearer <token>
```

**响应示例**

```json
{
    "success": true,
    "message": "添加收藏成功",
    "data": null
}
```

---

## 2. 商品接口

### 2.1 获取商品列表

**请求**

```
GET /products
```

**Query参数**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | Number | ❌ | 页码（默认1） |
| limit | Number | ❌ | 每页数量（默认20） |
| category | String | ❌ | 分类筛选 |
| minPrice | Number | ❌ | 最低价格 |
| maxPrice | Number | ❌ | 最高价格 |
| sort | String | ❌ | 排序字段 |
| keyword | String | ❌ | 搜索关键词 |

**响应示例**

```json
{
    "success": true,
    "message": "获取成功",
    "data": {
        "products": [
            {
                "_id": "2a7c6777-734c-428c-9281-af24874ef6db",
                "name": "运动T恤",
                "series": "破界系列",
                "category": "clothing",
                "price": 199,
                "originalPrice": 299,
                "discount": 33,
                "images": ["https://..."],
                "stock": 100,
                "sales": 520,
                "rating": 4.8,
                "outOfStock": false
            }
        ],
        "pagination": {
            "page": 1,
            "limit": 20,
            "total": 100,
            "pages": 5
        }
    }
}
```

---

### 2.2 获取商品详情

**请求**

```
GET /products/:id
```

**响应示例**

```json
{
    "success": true,
    "message": "获取成功",
    "data": {
        "_id": "2a7c6777-734c-428c-9281-af24874ef6db",
        "name": "运动T恤",
        "series": "破界系列",
        "category": "clothing",
        "price": 199,
        "originalPrice": 299,
        "description": "轻盈透气的运动T恤...",
        "images": ["https://..."],
        "stock": 100,
        "sales": 520,
        "rating": 4.8,
        "tags": ["运动", "透气"],
        "specs": {
            "material": "涤纶",
            "size": "M/L/XL",
            "color": "黑色/白色"
        },
        "isActive": true,
        "isFeatured": true,
        "createdAt": "2026-08-23T00:00:00.000Z"
    }
}
```

---

### 2.3 获取推荐商品

**请求**

```
GET /products/featured
```

**Query参数**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| limit | Number | ❌ | 返回数量（默认10） |

---

### 2.4 搜索商品

**请求**

```
GET /products/search
```

**Query参数**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| q | String | ✅ | 搜索关键词 |
| limit | Number | ❌ | 返回数量（默认20） |

---

## 3. 购物车接口

> 所有接口需要登录认证

### 3.1 获取购物车

**请求**

```
GET /cart
Authorization: Bearer <token>
```

**响应示例**

```json
{
    "success": true,
    "message": "获取成功",
    "data": {
        "items": [
            {
                "_id": "c30bb43b-ccf7-43fa-bb9d-c39a0bd52984",
                "product": {
                    "_id": "2a7c6777-734c-428c-9281-af24874ef6db",
                    "name": "运动T恤",
                    "price": 199,
                    "images": ["https://..."]
                },
                "quantity": 2,
                "selected": true
            }
        ],
        "totalItems": 2,
        "totalPrice": 398
    }
}
```

---

### 3.2 添加商品到购物车

**请求**

```
POST /cart/items
Authorization: Bearer <token>
Content-Type: application/json
```

**参数**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| productId | String | ✅ | 商品ID |
| quantity | Number | ❌ | 数量（默认1） |

---

### 3.3 更新商品数量

**请求**

```
PUT /cart/items/:productId
Authorization: Bearer <token>
Content-Type: application/json
```

**参数**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| quantity | Number | ✅ | 新数量 |

---

### 3.4 删除商品

**请求**

```
DELETE /cart/items/:productId
Authorization: Bearer <token>
```

---

### 3.5 验证优惠券

**请求**

```
POST /cart/validate-coupon
Authorization: Bearer <token>
Content-Type: application/json
```

**参数**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| code | String | ✅ | 优惠券码 |

**可用优惠券**

| 优惠券码 | 折扣 | 说明 |
|----------|------|------|
| VIP20 | 8折 | VIP会员优惠 |
| SUMMER30 | 7折 | 盛夏焕新优惠 |
| NEWUSER | 9折 | 新用户优惠 |

---

## 4. 订单接口

### 4.1 获取订单列表

**请求**

```
GET /orders
Authorization: Bearer <token>
```

**Query参数**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | Number | ❌ | 页码 |
| limit | Number | ❌ | 每页数量 |
| status | String | ❌ | 订单状态 |

**订单状态**

- `pending` - 待支付
- `paid` - 已支付
- `processing` - 处理中
- `shipped` - 已发货
- `delivered` - 已完成
- `cancelled` - 已取消

---

### 4.2 创建订单

**请求**

```
POST /orders
Authorization: Bearer <token>
Content-Type: application/json
```

**参数**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| shippingAddress | Object | ✅ | 收货地址 |
| couponCode | String | ❌ | 优惠券码 |
| paymentMethod | String | ❌ | 支付方式 |

**shippingAddress 参数**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| name | String | ✅ | 收货人 |
| phone | String | ✅ | 手机号 |
| address | String | ✅ | 详细地址 |

**响应示例**

```json
{
    "success": true,
    "message": "订单创建成功",
    "data": {
        "_id": "0e45590f-31f5-446e-9cee-5fec72667bb0",
        "orderNo": "ORD1234567890AB",
        "totalAmount": 598,
        "discountAmount": 0,
        "actualAmount": 598,
        "status": "pending",
        "createdAt": "2026-08-23T00:00:00.000Z"
    }
}
```

---

### 4.3 取消订单

**请求**

```
PUT /orders/:id/cancel
Authorization: Bearer <token>
```

---

### 4.4 确认收货

**请求**

```
PUT /orders/:id/confirm
Authorization: Bearer <token>
```

---

## 5. 错误码说明

### 通用错误码

| 错误码 | 说明 |
|--------|------|
| 200 | 操作成功 |
| 400 | 请求参数错误 |
| 401 | 未登录或Token过期 |
| 403 | 无权限访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

### 业务错误码

```json
{
    "success": false,
    "message": "商品不存在",
    "data": null
}
```

---

## 认证说明

### 获取Token

登录或注册成功后，返回的 `token` 即为JWT Token。

### 使用Token

在请求头中添加：

```
Authorization: Bearer <your_token_here>
```

### Token有效期

默认7天，过期后需要重新登录。

---

## 状态码说明

### HTTP状态码

| 状态码 | 说明 |
|--------|------|
| 200 OK | 请求成功 |
| 400 Bad Request | 请求参数错误 |
| 401 Unauthorized | 未认证 |
| 403 Forbidden | 无权限 |
| 404 Not Found | 资源不存在 |
| 500 Internal Server Error | 服务器错误 |

---

## 附录：Postman测试集合

如需测试API，可导入以下Postman集合：

```json
{
    "info": {
        "name": "古德因纳夫商城 API",
        "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
    },
    "item": [
        {
            "name": "用户认证",
            "item": [
                {
                    "name": "注册",
                    "request": {
                        "method": "POST",
                        "url": "{{baseUrl}}/auth/register",
                        "body": {
                            "mode": "raw",
                            "raw": "{\"username\":\"test\",\"email\":\"test@test.com\",\"password\":\"123456\"}"
                        }
                    }
                }
            ]
        }
    ]
}
```

---

**文档版本**: v1.1.0  
**最后更新**: 2026年8月  
**维护者**: 开发团队
