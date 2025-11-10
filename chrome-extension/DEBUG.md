# 🐛 Apply ID 捕获问题调试指南

## ⚠️ 问题描述
在 https://github.com/settings/education/benefits 页面点击"获取并复制 Apply ID"按钮时，显示"尚未检测到 Apply ID"。

## 🔧 解决方案
已从 **webRequest API** 改为 **Content Script** 方案，因为 Manifest V3 对 webRequest 有限制。

## 📝 更新内容

### 1. manifest.json
- ❌ 移除 `webRequest` 权限
- ✅ 添加 `storage` 权限
- ✅ 添加 `content_scripts` 配置

### 2. content.js（新文件）
- ✅ 拦截 fetch 和 XMLHttpRequest 请求
- ✅ 监听 DOM 变化，查找包含 metadata URL 的链接
- ✅ 扫描页面文本，提取 Apply ID
- ✅ 自动保存最大的 Apply ID

### 3. background.js
- ✅ 接收来自 content script 的消息
- ✅ 管理 Apply ID 存储
- ✅ 启动时从 storage 加载

### 4. popup.js
- ✅ 添加调试日志
- ✅ 优化错误提示

## 🚀 测试步骤

### 步骤 1: 重新加载扩展
```
1. 打开 chrome://extensions/
2. 找到 "GitHub Cookie Helper"
3. 点击 🔄 "重新加载" 按钮
4. 确认扩展已更新
```

### 步骤 2: 打开开发者工具
```
1. 右键点击扩展图标
2. 选择 "检查弹出内容"（查看 popup 日志）

或者：

1. chrome://extensions/
2. 点击 "Service Worker" 链接（查看 background 日志）
```

### 步骤 3: 访问 GitHub Education 页面
```
1. 打开新标签页
2. 访问: https://github.com/settings/education/benefits
3. 按 F12 打开控制台
4. 查看日志输出:
   [GitHub Cookie Helper] Content script 已注入
   [GitHub Cookie Helper] 页面加载完成，开始扫描 Apply ID
   [GitHub Cookie Helper] 找到 X 个 metadata 链接
   [GitHub Cookie Helper] 检测到 Apply ID: 1958995
```

### 步骤 4: 获取 Apply ID
```
1. 点击扩展图标
2. 按 F12 查看 Popup Console
3. 点击 "🔢 获取并复制 Apply ID" 按钮
4. 查看日志:
   [Popup] 请求获取 Apply ID
   [Popup] 收到响应: {applyId: 1958995}
```

## 🔍 调试命令

### 查看 Storage 中的 Apply ID
```javascript
// 在页面控制台或 Service Worker 执行:
chrome.storage.local.get(['maxApplyId'], (result) => {
  console.log('存储的 Apply ID:', result.maxApplyId);
});
```

### 手动保存 Apply ID
```javascript
// 在页面控制台执行:
chrome.runtime.sendMessage({
  action: 'saveApplyId',
  applyId: 1958995
}, (response) => {
  console.log('保存结果:', response);
});
```

### 清除存储的 Apply ID
```javascript
// 在 Popup Console 或 Service Worker 执行:
chrome.storage.local.remove('maxApplyId', () => {
  console.log('Apply ID 已清除');
});
```

### 查看 Content Script 是否注入
```javascript
// 在 GitHub Education 页面控制台执行:
console.log('Content script 状态:', window.fetch.toString().includes('GitHub Cookie Helper'));
```

## 📊 预期日志输出

### 页面控制台（GitHub Education）
```
[GitHub Cookie Helper] Content script 已注入
[GitHub Cookie Helper] 已设置网络请求拦截和 DOM 监听
[GitHub Cookie Helper] 页面加载完成，开始扫描 Apply ID
[GitHub Cookie Helper] 找到 2 个 metadata 链接
[GitHub Cookie Helper] 检测到 Apply ID: 1958995
[GitHub Cookie Helper] 当前最大 Apply ID: 1958995
[GitHub Cookie Helper] 检测到 Apply ID: 1958994
[GitHub Cookie Helper] 当前最大 Apply ID: 1958995
```

### Service Worker Console
```
[GitHub Cookie Helper] 后台服务已启动
[GitHub Cookie Helper] 更新最大 Apply ID: 1958995
[GitHub Cookie Helper] Apply ID 已保存到 storage
[GitHub Cookie Helper] 获取 Apply ID: 1958995
```

### Popup Console
```
[Popup] 请求获取 Apply ID
[Popup] 收到响应: {applyId: 1958995}
```

## ❌ 常见问题

### Q1: Content Script 未注入
**症状:** 页面控制台没有任何 `[GitHub Cookie Helper]` 日志

**解决方案:**
```
1. 检查 URL 是否匹配: https://github.com/settings/education/*
2. 重新加载扩展
3. 刷新 GitHub 页面（硬刷新: Ctrl+Shift+R）
4. 检查 manifest.json 中的 content_scripts 配置
```

### Q2: 检测到 Apply ID 但无法获取
**症状:** 页面有日志，但 popup 显示"尚未检测到"

**解决方案:**
```
1. 检查 storage 权限
2. 查看 Service Worker 日志
3. 执行调试命令查看 storage:
   chrome.storage.local.get(['maxApplyId'], console.log)
```

### Q3: 页面没有 metadata 请求
**症状:** 日志显示"找到 0 个 metadata 链接"

**解决方案:**
```
1. 确认 GitHub 页面已完全加载
2. 检查是否有 Education 申请
3. 手动滚动页面触发内容加载
4. 查看 Network 标签，确认是否有 metadata 请求
```

## 🎯 工作原理

### Content Script 捕获方式
```
1. 拦截 fetch/XHR 请求（实时捕获）
2. 监听 DOM 变化（动态内容）
3. 扫描页面链接（已加载内容）
4. 扫描页面文本（纯文本提取）
```

### 通信流程
```
GitHub 页面
  ↓ (检测到 Apply ID)
Content Script
  ↓ (chrome.runtime.sendMessage)
Background Service Worker
  ↓ (chrome.storage.local.set)
Chrome Storage
  ↓ (chrome.storage.local.get)
Popup UI
  ↓ (显示并复制)
用户剪贴板
```

## ✅ 验证清单

- [ ] 扩展已重新加载
- [ ] Content script 成功注入
- [ ] 页面控制台有检测日志
- [ ] Service Worker 有保存日志
- [ ] Storage 中有 maxApplyId
- [ ] Popup 能获取到 Apply ID
- [ ] Apply ID 成功复制到剪贴板

## 📞 还是不行？

如果以上方法都无效，请提供以下信息：

1. **页面控制台日志截图**（按 F12）
2. **Service Worker 日志截图**（chrome://extensions/ → Service Worker）
3. **Popup 控制台日志**（右键扩展图标 → 检查弹出内容）
4. **Storage 内容**：
   ```javascript
   chrome.storage.local.get(null, console.log)
   ```
5. **Network 标签截图**（过滤: metadata）

---

**更新时间: 2025-11-10**
**版本: 1.0.1**
