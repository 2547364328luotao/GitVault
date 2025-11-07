# 🔐 GitVault

GitVault 是一个安全的 GitHub 账号密码备忘录系统，使用 Next.js 和 Neon 数据库构建。

## 功能特性

- ✅ **安全认证系统**: 基于会话令牌的身份验证
- ✅ **加密保护**: HMAC-SHA256 签名,防止令牌伪造
- ✅ 安全存储 GitHub 账号信息
- ✅ 管理邮箱账号和密码
- ✅ 存储 GitHub 恢复代码
- ✅ 卡密系统:生成和管理访问卡密
- ✅ 公开查询门户:通过卡密查询账号信息
- ✅ 邮件收件箱:实时 IMAP 邮件获取
- ✅ 响应式设计,支持深色模式
- ✅ 完整的 CRUD 操作(创建、读取、更新、删除)

## 数据字段

每个账号记录包含以下信息：

- 📧 邮箱账号
- 🔑 邮箱密码
- 📱 邮箱绑定手机号
- 👤 GitHub 账号
- 🔒 GitHub 密码
- 🏷️ GitHub Name
- 🔐 GitHub Recovery Codes

## 技术栈

- **前端框架**: Next.js 14 (App Router)
- **样式**: Tailwind CSS
- **数据库**: Neon (Serverless PostgreSQL)
- **语言**: TypeScript
- **数据库客户端**: @neondatabase/serverless

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 文件为 `.env.local` 并配置以下变量:

```bash
# 数据库连接
DATABASE_URL=your_neon_database_url_here

# 管理员凭证 (重要: 生产环境必须修改!)
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_strong_password_here

# 会话密钥 (生成方法见下方)
SESSION_SECRET=your_random_session_secret

# IMAP 邮件配置
IMAP_USER=your_email@example.com
IMAP_PASSWORD=your_imap_password
IMAP_HOST=imap.example.com
IMAP_PORT=993
```

**生成会话密钥**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

⚠️ **安全提示**: 
- 不要使用默认密码
- 不要将 `.env.local` 提交到 Git
- 生产环境在 Vercel 控制台配置环境变量

### 3. 运行开发服务器

```bash
npm run dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看应用。

### 4. 构建生产版本

```bash
npm run build
npm start
```

## API 路由

### 认证 API
```
POST /api/auth/login      # 登录
GET  /api/auth/check      # 检查会话
POST /api/auth/logout     # 登出
```

### 账号管理 API (需要认证)
```
GET    /api/accounts      # 获取所有账号
GET    /api/accounts/[id] # 获取单个账号
POST   /api/accounts      # 创建新账号
PUT    /api/accounts/[id] # 更新账号
DELETE /api/accounts/[id] # 删除账号
```

### 卡密管理 API (需要认证)
```
GET  /api/access-codes         # 获取所有卡密
POST /api/access-codes/verify  # 验证卡密 (公开访问)
```

### 邮件 API (需要认证)
```
GET /api/emails  # 获取邮件列表
```

## 数据库结构

```sql
CREATE TABLE github_accounts (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  email_password VARCHAR(255) NOT NULL,
  email_phone VARCHAR(50),
  github_username VARCHAR(255) NOT NULL,
  github_password VARCHAR(255) NOT NULL,
  github_name VARCHAR(255),
  github_recovery_codes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 项目结构

```
GitVault/
├── app/
│   ├── api/
│   │   └── accounts/
│   │       ├── route.ts
│   │       └── [id]/
│   │           └── route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── AccountForm.tsx
│   └── AccountList.tsx
├── lib/
│   └── db.ts
├── .env.local
├── .env.example
├── .gitignore
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.ts
└── tsconfig.json
```

## 安全特性

### 🔐 身份验证系统
- **加密会话令牌**: HMAC-SHA256 签名防止伪造
- **常量时间比较**: 防止时序攻击
- **自动过期**: 7 天会话过期
- **安全 Cookie**: httpOnly + secure + sameSite
- **防暴力破解**: 登录延迟保护
- **日志记录**: 记录所有登录尝试

### 🛡️ 访问控制
- **需要登录**: 所有管理页面和 API
- **公开访问**: 登录页 + Portal 卡密查询
- **中间件保护**: 自动验证所有请求

详细安全配置请查看 [SECURITY.md](./SECURITY.md)

## 部署到 Vercel

### 1. 推送代码到 GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/gitvault.git
git push -u origin main
```

### 2. 在 Vercel 导入项目

1. 访问 [Vercel](https://vercel.com)
2. 点击 "Import Project"
3. 选择你的 GitHub 仓库

### 3. 配置环境变量

在 Vercel 项目设置中添加环境变量:

```
DATABASE_URL=your_neon_database_url
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_strong_password
SESSION_SECRET=your_generated_secret
IMAP_USER=your_email
IMAP_PASSWORD=your_imap_password
IMAP_HOST=imap.example.com
IMAP_PORT=993
```

### 4. 部署

点击 "Deploy" 按钮,等待部署完成。

⚠️ **部署前检查清单**:
- [ ] 已设置强密码
- [ ] 已生成随机 SESSION_SECRET
- [ ] 已配置数据库 URL
- [ ] 已测试所有功能
- [ ] 已查看 [SECURITY.md](./SECURITY.md)

## 安全提示

⚠️ **重要**: 
- ✅ **已实现**: 基于会话令牌的身份验证系统
- ✅ **已实现**: HMAC-SHA256 签名防伪造
- ✅ **已实现**: 中间件自动保护所有路由
- ✅ **已实现**: 防暴力破解延迟机制
- 🔄 **建议**: 生产环境使用 HTTPS (Vercel 自动提供)
- 🔄 **建议**: 定期更换管理员密码(90天)
- 🔄 **建议**: 启用数据库备份
- 🔄 **建议**: 考虑对敏感数据进行加密存储
- 🔄 **建议**: 设置 IP 白名单限制访问

## 开发计划

- [x] 添加用户身份验证 ✅
- [x] 会话管理和令牌签名 ✅
- [x] 中间件路由保护 ✅
- [x] 卡密系统 ✅
- [x] 邮件收件箱 ✅
- [ ] 数据加密存储
- [ ] 导出/导入功能
- [ ] 搜索和过滤功能
- [ ] 批量操作
- [ ] 自动备份功能
- [ ] 双因素认证(2FA)
- [ ] API 访问频率限制

## License

MIT

## 作者

GitVault Team
