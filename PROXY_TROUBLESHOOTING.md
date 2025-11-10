# 代理问题排查与解决方案

## 🔍 问题诊断

根据测试结果，您的代理 `http://134.199.184.206:8888` 存在以下问题：

```
❌ Parse Error: Expected HTTP/, RTSP/ or ICE/
```

这表明代理服务器返回的响应格式不符合标准 HTTP 协议。

---

## 🎯 推荐解决方案

### 方案一：使用本地代理（推荐）

如果您有本地 VPN 或代理工具（如 Clash、V2Ray、Shadowsocks），使用本地代理更稳定：

#### 1. Clash / Clash for Windows

```bash
# .env.local
PROXY_URL=http://127.0.0.1:7890
# 或
PROXY_URL=socks5://127.0.0.1:7890
```

#### 2. V2Ray / V2RayN

```bash
# .env.local
PROXY_URL=http://127.0.0.1:10809
# 或
PROXY_URL=socks5://127.0.0.1:10808
```

#### 3. Shadowsocks

```bash
# .env.local
PROXY_URL=socks5://127.0.0.1:1080
```

### 方案二：修复远程代理

如果必须使用远程代理 `http://134.199.184.206:8888`，需要确保：

1. **代理类型正确**
   ```bash
   # 如果是 SOCKS5 代理
   PROXY_URL=socks5://134.199.184.206:8888
   
   # 如果是 HTTP 代理
   PROXY_URL=http://134.199.184.206:8888
   ```

2. **代理服务器配置**
   - 确保 tinyproxy 正确配置
   - 检查防火墙规则
   - 验证代理服务器日志

### 方案三：不使用代理（临时方案）

如果您可以直接访问 GitHub：

```bash
# .env.local
# 注释掉或删除 PROXY_URL
# PROXY_URL=http://134.199.184.206:8888
```

**注意**：中国大陆用户通常无法直接访问 GitHub API。

---

## 🧪 测试代理是否可用

### 方法 1：使用浏览器测试

1. 在浏览器中配置代理：
   - 地址：`134.199.184.206`
   - 端口：`8888`

2. 访问 `https://github.com`

3. 如果可以访问，说明代理本身是可用的，问题在于 Node.js 的代理配置

### 方法 2：使用 curl 测试

```bash
# 测试 HTTP 代理
curl -x http://134.199.184.206:8888 https://github.com -v

# 测试 SOCKS5 代理（如果适用）
curl -x socks5://134.199.184.206:8888 https://github.com -v
```

### 方法 3：使用 Node.js 脚本测试

创建 `test-proxy.js`：

```javascript
const https = require('https');
const { HttpsProxyAgent } = require('https-proxy-agent');

const agent = new HttpsProxyAgent('http://134.199.184.206:8888');

https.get('https://api.github.com', { agent }, (res) => {
  console.log('✅ 代理可用，状态码:', res.statusCode);
  res.on('data', () => {});
}).on('error', (err) => {
  console.error('❌ 代理失败:', err.message);
});
```

运行：
```bash
node test-proxy.js
```

---

## 🔧 推荐配置（中国大陆用户）

### 使用 Clash

1. **安装 Clash for Windows**
   - 下载：https://github.com/Fndroid/clash_for_windows_pkg/releases

2. **配置订阅**
   - 导入您的代理订阅链接
   - 开启系统代理

3. **配置项目**
   ```bash
   # .env.local
   PROXY_URL=http://127.0.0.1:7890
   ```

4. **验证**
   ```bash
   # 在项目目录运行
   node test-education-query.js
   ```

### 使用 V2RayN

1. **安装 V2RayN**
   - 下载：https://github.com/2dust/v2rayN/releases

2. **配置节点**
   - 添加您的 V2Ray 节点
   - 启动代理

3. **配置项目**
   ```bash
   # .env.local
   PROXY_URL=socks5://127.0.0.1:10808
   ```

---

## 📊 代理类型对比

| 代理类型 | 协议 | 端口示例 | 配置格式 | 推荐度 |
|---------|------|---------|---------|--------|
| **HTTP** | HTTP/HTTPS | 7890, 8118 | `http://127.0.0.1:7890` | ⭐⭐⭐⭐ |
| **SOCKS5** | SOCKS5 | 1080, 10808 | `socks5://127.0.0.1:1080` | ⭐⭐⭐⭐⭐ |
| **HTTPS** | HTTPS | 443 | `https://proxy.com:443` | ⭐⭐⭐ |

**推荐**：SOCKS5 代理通常更稳定、速度更快。

---

## ⚠️ 常见错误及解决

### 错误 1：Parse Error: Expected HTTP/

**原因**：代理返回的响应格式不标准

**解决**：
1. 尝试使用 SOCKS5 而不是 HTTP
2. 切换到本地代理
3. 检查代理服务器配置

### 错误 2：ECONNREFUSED

**原因**：代理服务器未运行或端口错误

**解决**：
1. 确认代理服务器正在运行
2. 检查端口号是否正确
3. 验证防火墙规则

### 错误 3：ETIMEDOUT

**原因**：代理连接超时

**解决**：
1. 检查网络连接
2. 尝试增加超时时间
3. 切换到更快的代理节点

### 错误 4：Proxy Authentication Required

**原因**：代理需要认证

**解决**：
```bash
# .env.local
PROXY_URL=http://username:password@proxy.com:8888
```

---

## 🚀 最佳实践

### 1. 本地代理优先

```bash
# 推荐顺序
1. SOCKS5 本地代理 (socks5://127.0.0.1:xxx)
2. HTTP 本地代理 (http://127.0.0.1:xxx)
3. 远程代理（备用）
```

### 2. 配置多个代理备份

```bash
# .env.local
PROXY_URL=http://127.0.0.1:7890
# HTTP_PROXY=http://134.199.184.206:8888  # 备用
```

### 3. 定期测试代理

```bash
# 每次使用前测试
node test-education-query.js
```

---

## 🆘 紧急方案

如果所有代理都失败，可以考虑：

### 方案 A：使用浏览器插件手动查询

1. 安装代理插件（如 SwitchyOmega）
2. 在浏览器中访问：`https://github.com/settings/education/benefits`
3. 手动查看申请状态

### 方案 B：暂时注释代理，在境外服务器运行

1. 将项目部署到境外服务器（如 Vercel、Netlify）
2. 在境外服务器上查询
3. 不需要配置代理

---

## 📞 获取帮助

如果问题仍未解决：

1. **检查代理日志**
   ```bash
   # tinyproxy 日志位置
   /var/log/tinyproxy/tinyproxy.log
   ```

2. **查看 Next.js 服务器日志**
   ```bash
   npm run dev
   # 观察终端输出
   ```

3. **提供完整错误信息**
   - 代理类型和地址
   - 完整错误堆栈
   - 测试脚本输出

---

## 📝 总结

**当前问题**：您的远程代理 `http://134.199.184.206:8888` 返回格式异常

**推荐解决**：
1. ✅ 使用本地代理工具（Clash / V2Ray）
2. ✅ 配置 `PROXY_URL=http://127.0.0.1:7890` 或 `socks5://127.0.0.1:10808`
3. ✅ 运行测试验证：`node test-education-query.js`

**备选方案**：
- 修复远程代理服务器配置
- 在浏览器中手动查询
- 部署到境外服务器

祝您使用愉快！🎉
