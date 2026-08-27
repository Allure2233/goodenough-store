# 古德因纳夫商城 - 项目规范文档

## 代码规范

### 1.1 HTML规范

- 使用语义化标签（header, nav, main, section, article, footer）
- 属性值使用双引号包裹
- 标签必须正确闭合
- 图片必须添加alt属性
- 使用data-*属性存储数据
- 保持合理的DOM层级

### 1.2 CSS规范

- 使用CSS变量管理主题颜色
- 采用BEM命名规范：`block__element--modifier`
- 使用类选择器，避免使用ID和标签选择器
- 移动端优先的响应式设计
- 动画使用transform和opacity实现GPU加速
- 颜色值使用变量或十六进制，避免硬编码

```css
/* BEM 命名示例 */
.product-card {}
.product-card__image {}
.product-card__title {}
.product-card--featured {}
```

### 1.3 JavaScript规范

- 使用ES6+语法（const, let, arrow function, destructuring）
- 使用async/await处理异步操作
- 事件委托优化性能
- 模块化组织代码
- 添加适当的注释
- 错误处理和异常捕获

```javascript
// Good
const fetchData = async (url) => {
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
};

// Bad
function fetchData(url) {
    fetch(url).then(response => {
        response.json().then(data => {
            return data;
        });
    });
}
```

### 1.4 API规范

- RESTful风格URL设计
- 使用HTTP方法语义（GET/POST/PUT/DELETE）
- 统一响应格式
- 合适的HTTP状态码
- JWT Token认证

```json
// 统一响应格式
{
    "success": true,
    "message": "操作成功",
    "data": { ... }
}

// 错误响应
{
    "success": false,
    "message": "错误信息",
    "error": { ... }
}
```

---

## Git提交规范

### 2.1 Commit Message格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 2.2 Type类型

| 类型 | 描述 |
|------|------|
| feat | 新功能 |
| fix | Bug修复 |
| docs | 文档更新 |
| style | 代码格式（不影响功能） |
| refactor | 重构 |
| perf | 性能优化 |
| test | 测试相关 |
| build | 构建相关 |
| ci | CI/CD相关 |
| chore | 其他更改 |

### 2.3 示例

```
feat(auth): 添加JWT用户认证

- 实现用户注册接口
- 实现用户登录接口
- 添加Token验证中间件

Closes #123
```

---

## 测试规范

### 3.1 测试类型

- **单元测试**: 验证独立函数和模块
- **集成测试**: 验证API端点
- **E2E测试**: 验证完整用户流程

### 3.2 测试覆盖率

- 目标：核心业务逻辑覆盖率达到80%以上
- API接口必须测试
- 关键工具函数必须测试

---

## 安全规范

### 4.1 密码安全

- 密码必须加密存储（使用bcrypt）
- 密码强度验证
- 避免明文传输密码

### 4.2 认证授权

- JWT Token设置合理的过期时间
- 敏感操作需要重新验证
- 防止CSRF攻击
- 防止XSS攻击

### 4.3 数据安全

- 敏感数据加密存储
- API接口限流
- SQL注入防护
- 输入验证和消毒

---

## 性能规范

### 5.1 前端性能

- 首屏加载时间 < 3秒
- 图片使用懒加载
- CSS和JS文件压缩
- 使用CDN加速静态资源
- 开启Gzip压缩

### 5.2 后端性能

- API响应时间 < 200ms
- 数据库查询优化
- 使用缓存（Redis/Memory）
- 分页查询

### 5.3 监控指标

- Lighthouse评分 > 90
- Core Web Vitals达标
- 错误率 < 1%

---

## 部署规范

### 6.1 环境配置

- 开发环境 (development)
- 测试环境 (testing)
- 生产环境 (production)

### 6.2 环境变量

```bash
# .env.example
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://goodenough_app:password@localhost:5432/goodenough
PGSSL=false
PGPOOL_MAX=10
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
```

### 6.3 部署流程

1. 代码审查（Code Review）
2. 运行测试
3. 构建项目
4. 部署到服务器
5. 健康检查
6. 监控日志

---

## 文档规范

### 7.1 必需文档

- README.md - 项目说明
- SPEC.md - 项目规范（本文档）
- API.md - 接口文档
- DEPLOY.md - 部署文档

### 7.2 文档更新

- 新增功能必须更新文档
- 重构代码必须更新注释
- Bug修复记录在CHANGELOG.md

---

## 版本管理

### 8.1 语义化版本

```
主版本.次版本.修订号
1.0.0
```

- 主版本：不兼容的API修改
- 次版本：向后兼容的功能新增
- 修订号：向后兼容的Bug修复

### 8.2 发布流程

1. 更新版本号
2. 更新CHANGELOG
3. 创建Git Tag
4. 构建发布包
5. 发布到生产环境

---

## 项目里程碑

| 版本 | 日期 | 功能 |
|------|------|------|
| v1.0.0 | 2024-XX-XX | 完成基础功能 |

---

## 参考资料

- [MDN Web Docs](https://developer.mozilla.org/)
- [Node.js Documentation](https://nodejs.org/docs/)
- [Express.js Guide](https://expressjs.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [node-postgres Documentation](https://node-postgres.com/)
- [RESTful API 设计规范](https://restfulapi.cn/)
