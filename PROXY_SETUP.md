# 代理配置指南

## 问题描述

如果你遇到以下错误：
```
ConnectTimeoutError: Connect Timeout Error (attempted address: github.com:443, timeout: 10000ms)
```

这说明本地开发环境无法直接访问 GitHub API。在中国大陆地区，通常需要配置代理才能访问 GitHub。

## 解决方案

### 方案一：配置系统代理（推荐）

#### 1. 确保你有可用的代理软件

常见的代理软件：
- Clash for Windows
- V2rayN
- Shadowsocks

#### 2. 获取代理端口

大多数代理软件默认端口：
- HTTP/HTTPS 代理：`7890`
- SOCKS5 代理：`7890` 或 `1080`

在代理软件中查看实际端口号。

#### 3. 配置环境变量

在 `.env.local` 文件中添加：

```bash
# HTTP/HTTPS 代理
HTTP_PROXY=http://127.0.0.1:7890
HTTPS_PROXY=http://127.0.0.1:7890

# 或者使用 SOCKS5 代理
# HTTP_PROXY=socks5://127.0.0.1:7890
# HTTPS_PROXY=socks5://127.0.0.1:7890
```

#### 4. 重启开发服务器

```bash
# 停止当前服务器 (Ctrl+C)
# 重新启动
npm run dev
```

### 方案二：使用 Cloudflare Workers 代理（适合生产环境）

如果你需要在生产环境（Vercel）也能正常使用，可以创建一个 Cloudflare Workers 代理：

#### 1. 创建 Worker

```javascript
// worker.js
export default {
  async fetch(request) {
    const url = new URL(request.url);
    const targetUrl = url.searchParams.get('url');
    
    if (!targetUrl) {
      return new Response('Missing url parameter', { status: 400 });
    }
    
    // 转发请求到目标 URL
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body
    });
    
    return response;
  }
};
```

#### 2. 在代码中使用代理

修改 `/app/api/check-education/route.ts`，添加代理 URL：

```typescript
const proxyUrl = process.env.PROXY_URL; // https://your-worker.workers.dev
const targetUrl = 'https://github.com/settings/education/benefits';
const fetchUrl = proxyUrl 
  ? `${proxyUrl}?url=${encodeURIComponent(targetUrl)}`
  : targetUrl;

const response = await fetch(fetchUrl, fetchOptions);
```

### 方案三：本地测试时直接使用浏览器获取 HTML

如果只是测试功能，可以：

1. 在浏览器中访问：`https://github.com/settings/education/benefits`
2. 按 F12 打开开发者工具
3. 在 Console 中运行：
```javascript
copy(document.documentElement.outerHTML)
```
4. HTML 已复制到剪贴板，可以用于本地测试解析逻辑

## 验证配置

配置完成后，你可以：

1. 重启 `npm run dev`
2. 在账号列表中点击"查询申请状态"
3. 如果看到"使用代理访问 GitHub"的日志，说明代理配置成功

## 常见问题

### Q: 配置了代理还是超时？

A: 检查：
1. 代理软件是否正在运行
2. 端口号是否正确
3. 代理模式是否设置为"全局模式"或"规则模式"
4. 尝试在浏览器中访问 https://github.com 验证代理是否工作

### Q: 不想配置代理？

A: 可以使用替代方案：
1. 在浏览器中手动查看 GitHub Education 状态
2. 使用 GitHub API（需要 Personal Access Token）
3. 部署到有网络访问权限的服务器（如海外 VPS）

### Q: Vercel 部署后能正常使用吗？

A: Vercel 的服务器位于海外，可以直接访问 GitHub，不需要代理。但如果你需要确保稳定性，建议使用方案二（Cloudflare Workers 代理）。

## 安全提示

⚠️ **重要**：
- 不要在公共仓库中提交包含真实代理地址的 `.env.local` 文件
- 确保 `.env.local` 在 `.gitignore` 中
- Cookie 包含敏感信息，请妥善保管
