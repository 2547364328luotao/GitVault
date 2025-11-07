# 🔐 GitVault

GitVault 是一个安全的 GitHub 账号密码备忘录系统，使用 Next.js 和 Neon 数据库构建。

## 功能特性

- ✅ 安全存储 GitHub 账号信息
- ✅ 管理邮箱账号和密码
- ✅ 存储 GitHub 恢复代码
- ✅ 响应式设计，支持深色模式
- ✅ 完整的 CRUD 操作（创建、读取、更新、删除）
- ✅ 密码显示/隐藏功能

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

复制 `.env.example` 文件为 `.env.local` 并填入你的 Neon 数据库连接字符串：

```bash
DATABASE_URL=your_neon_database_url_here
```

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

### 获取所有账号
```
GET /api/accounts
```

### 获取单个账号
```
GET /api/accounts/[id]
```

### 创建新账号
```
POST /api/accounts
```

### 更新账号
```
PUT /api/accounts/[id]
```

### 删除账号
```
DELETE /api/accounts/[id]
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

## 安全提示

⚠️ **重要**: 
- 此应用存储敏感信息，请确保在生产环境中使用适当的安全措施
- 考虑添加身份验证和授权机制
- 使用 HTTPS 保护数据传输
- 定期备份数据库
- 考虑对敏感数据进行加密

## 开发计划

- [ ] 添加用户身份验证
- [ ] 数据加密存储
- [ ] 导出/导入功能
- [ ] 搜索和过滤功能
- [ ] 批量操作
- [ ] 数据备份功能

## License

MIT

## 作者

GitVault Team
