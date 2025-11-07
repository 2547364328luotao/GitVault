# GitVault 安全配置指南

## 🔐 身份验证系统

GitVault 使用基于会话令牌的身份验证系统,所有敏感页面和 API 都需要登录访问。

### 安全特性

1. **加密会话令牌**: 使用 HMAC-SHA256 签名,防止令牌伪造
2. **常量时间比较**: 防止时序攻击
3. **自动过期**: 会话令牌 7 天后自动过期
4. **严格的 Cookie 设置**: 
   - `httpOnly`: 防止 XSS 攻击
   - `secure`: 生产环境仅 HTTPS 传输
   - `sameSite: strict`: 防止 CSRF 攻击
5. **防暴力破解**: 登录请求添加 1 秒延迟
6. **日志记录**: 记录所有登录尝试(成功和失败)

## 🚀 部署前必须配置

### 1. 设置管理员凭证

在 Vercel 或其他部署平台的环境变量中设置:

```bash
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_strong_password_here
```

⚠️ **重要**: 
- 不要使用默认密码 `change_this_password`
- 密码至少 12 位,包含大小写字母、数字和特殊字符
- 不要在代码中硬编码密码

### 2. 生成会话密钥

生成一个随机的会话密钥:

```bash
# 在终端运行
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

将输出设置为环境变量:

```bash
SESSION_SECRET=your_generated_secret_here
```

### 3. 其他环境变量

```bash
# 数据库
DATABASE_URL=your_neon_database_url

# IMAP 配置
IMAP_USER=your_email@example.com
IMAP_PASSWORD=your_imap_password
IMAP_HOST=imap.example.com
IMAP_PORT=993
```

## 🔒 访问控制

### 需要登录的页面
- `/` - 首页
- `/inbox` - 收件箱
- `/accounts` - 账号管理
- 所有 API 路由(除了公开 API)

### 公开访问页面
- `/login` - 登录页面
- `/portal` - 卡密查询门户(仅查询功能,不能修改数据)

### 公开访问 API
- `POST /api/auth/login` - 登录
- `GET /api/auth/check` - 会话检查
- `POST /api/access-codes/verify` - 卡密验证

## 🛡️ 安全建议

### 生产环境

1. **启用 HTTPS**
   - Vercel 自动提供 HTTPS
   - 确保 `NODE_ENV=production`

2. **定期更换密码**
   - 建议每 90 天更换管理员密码
   - 更新 Vercel 环境变量后重新部署

3. **监控日志**
   - 定期检查 Vercel 日志
   - 关注失败的登录尝试
   - 设置异常登录提醒

4. **限制 IP 访问**
   - 如果可能,使用 Vercel 的 IP 白名单功能
   - 限制管理页面的访问 IP

5. **数据库安全**
   - 使用 Neon 的 IP 白名单
   - 定期备份数据库
   - 不要在客户端暴露敏感信息

### 开发环境

1. **本地环境变量**
   - 使用 `.env.local` 存储本地凭证
   - 不要提交 `.env.local` 到 Git

2. **测试凭证**
   - 使用与生产环境不同的测试凭证
   - 测试数据库与生产数据库分离

## 🚨 安全事件响应

### 如果怀疑账号泄露

1. **立即更换密码**
   ```bash
   # 在 Vercel 控制台更新
   ADMIN_PASSWORD=new_strong_password
   ```

2. **重新生成会话密钥**
   ```bash
   SESSION_SECRET=new_generated_secret
   ```

3. **检查日志**
   - 查看 Vercel 部署日志
   - 检查异常访问记录

4. **通知用户**
   - 如果有数据泄露,通知相关用户
   - 重置所有卡密

## 📋 安全检查清单

部署前请确认:

- [ ] 已设置强密码 `ADMIN_PASSWORD`
- [ ] 已生成随机 `SESSION_SECRET`
- [ ] 已配置正确的 `DATABASE_URL`
- [ ] 已在 Vercel 设置环境变量
- [ ] 已启用 HTTPS (生产环境)
- [ ] 已测试登录和登出功能
- [ ] 已测试未授权访问重定向
- [ ] 已检查所有 API 路由需要认证
- [ ] 已查看部署日志无错误

## 🔗 相关文档

- [Vercel 环境变量](https://vercel.com/docs/environment-variables)
- [Next.js 中间件](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [OWASP 安全指南](https://owasp.org/www-project-top-ten/)

## 📞 支持

如果发现安全漏洞,请立即联系管理员。
