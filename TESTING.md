# 测试工具说明

本项目提供了两个测试脚本来验证功能是否正常。

## 📋 测试脚本

### 1. test-proxy.js - 代理连接测试

**用途**：快速验证代理配置是否正确

**使用方法**：
```bash
# 测试指定代理
node test-proxy.js http://127.0.0.1:7890

# 测试 SOCKS5 代理
node test-proxy.js socks5://127.0.0.1:10808

# 测试 .env.local 中配置的代理
node test-proxy.js
```

**测试内容**：
- ✅ 代理连接状态
- ✅ GitHub API 访问
- ✅ GitHub Website 访问
- ✅ 与直连的对比

**预期结果**：
```
✅ GitHub API - 连接成功
✅ GitHub Website - 连接成功
✅ Google DNS - 连接成功
```

---

### 2. test-education-query.js - Education 查询功能测试

**用途**：全面测试 GitHub Education 申请状态查询功能

**使用方法**：
```bash
node test-education-query.js
```

**测试内容**：
- ✅ Cookie 格式验证
- ✅ 代理连接测试
- ✅ GitHub 访问测试
- ✅ API 端点测试

**预期结果**：
```
✅ Cookie 格式验证 - 通过
✅ 代理连接测试 - 通过
✅ GitHub 访问测试 - 通过
✅ API 端点测试 - 通过

🎉 所有测试通过 (4/4)
```

---

## 🔧 故障排查

### 代理测试失败

如果 `test-proxy.js` 显示连接失败：

1. **检查代理配置**
   ```bash
   # 确认 .env.local 中的配置
   cat .env.local | grep PROXY_URL
   ```

2. **验证代理服务器运行**
   - Clash: 检查系统托盘图标
   - V2Ray: 检查 V2RayN 是否运行
   - Shadowsocks: 检查 SS 客户端

3. **尝试不同代理类型**
   ```bash
   # HTTP 代理
   node test-proxy.js http://127.0.0.1:7890
   
   # SOCKS5 代理
   node test-proxy.js socks5://127.0.0.1:10808
   ```

4. **查看详细文档**
   - [PROXY_SETUP.md](./PROXY_SETUP.md) - 代理配置指南
   - [PROXY_TROUBLESHOOTING.md](./PROXY_TROUBLESHOOTING.md) - 问题排查

---

### Education 查询测试失败

如果 `test-education-query.js` 部分测试失败：

#### Cookie 格式验证失败
- 检查 Cookie 是否包含 `user_session=`
- 确认没有 `Cookie:` 前缀

#### 代理连接失败
- 先运行 `node test-proxy.js` 验证代理
- 检查 `.env.local` 中的 `PROXY_URL` 配置

#### GitHub 访问失败
- 确认代理正在运行
- 尝试在浏览器中访问 GitHub
- 检查网络连接

#### API 端点失败
- 确保开发服务器正在运行：`npm run dev`
- 检查端口 3000 是否被占用
- 查看服务器日志

---

## 📚 相关文档

- [HOW_TO_CHECK_EDUCATION_STATUS.md](./HOW_TO_CHECK_EDUCATION_STATUS.md) - 查询申请状态完整教程
- [COOKIE_GUIDE.md](./COOKIE_GUIDE.md) - Cookie 获取指南
- [PROXY_SETUP.md](./PROXY_SETUP.md) - 代理配置详细教程
- [PROXY_TROUBLESHOOTING.md](./PROXY_TROUBLESHOOTING.md) - 代理问题排查

---

## 💡 最佳实践

### 首次使用

1. **安装依赖**
   ```bash
   npm install
   ```

2. **配置代理**（中国大陆用户必需）
   ```bash
   # 编辑 .env.local
   PROXY_URL=http://127.0.0.1:7890
   ```

3. **测试代理**
   ```bash
   node test-proxy.js
   ```

4. **测试完整功能**
   ```bash
   node test-education-query.js
   ```

5. **启动开发服务器**
   ```bash
   npm run dev
   ```

### 定期检查

建议在以下情况运行测试：

- ✅ 更换代理节点后
- ✅ 网络环境变化后
- ✅ 长时间未使用后
- ✅ 遇到查询失败时

---

## 🎯 快速诊断

运行这个命令快速检查所有关键功能：

```bash
# 1. 测试代理
node test-proxy.js && echo "✅ 代理正常" || echo "❌ 代理异常"

# 2. 测试完整功能
node test-education-query.js
```

如果两个测试都通过，说明系统配置正确，可以正常使用！🎉
