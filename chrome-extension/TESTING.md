# Chrome 扩展测试指南

## 🎯 测试目标
验证扩展能够自动捕获 GitHub Education 的 Apply ID（取最大值）

## 📋 测试步骤

### 1. 安装扩展

1. 打开 Chrome: `chrome://extensions/`
2. 开启"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择 `c:\Code\React\GitVault\chrome-extension` 文件夹
5. 确认扩展已安装（显示绿色图标）

### 2. 测试 Apply ID 自动捕获

#### 步骤 A: 访问 GitHub Education
```
1. 打开新标签页
2. 访问: https://github.com/settings/education/benefits
3. 等待页面完全加载
4. 观察浏览器控制台（F12）查看是否有扩展日志
```

#### 步骤 B: 检查后台服务
```
1. 访问 chrome://extensions/
2. 找到 "GitHub Cookie Helper"
3. 点击 "Service Worker" 链接（查看后台日志）
4. 应该看到类似输出:
   [GitHub Cookie Helper] 后台服务已启动
   [GitHub Cookie Helper] 检测到新的 Apply ID: 1958995
   [GitHub Cookie Helper] 检测到新的 Apply ID: 1958994
```

#### 步骤 C: 获取 Apply ID
```
1. 点击浏览器工具栏的扩展图标
2. 点击 "🔢 获取并复制 Apply ID" 按钮
3. 验证:
   - 界面显示最大的 Apply ID（如 1958995）
   - 提示 "✅ Apply ID 已复制到剪贴板！"
   - 剪贴板内容为该数字
```

### 3. 测试 Cookie 获取

```
1. 确保已登录 GitHub
2. 点击扩展图标
3. 点击 "📋 获取并复制 Cookie" 按钮
4. 验证:
   - Cookie 预览显示（前 200 个字符）
   - 提示 "✅ Cookie 已复制到剪贴板！"
   - 剪贴板包含完整 Cookie 字符串
```

### 4. 测试 GitVault 集成

```
1. 点击扩展中的 "🚀 打开 GitVault" 按钮
2. GitVault 应在新标签页打开（localhost:3001）
3. 创建/编辑账号:
   - 粘贴 Cookie
   - 粘贴 Apply ID
4. 点击 "🔍 查询申请状态"
5. 验证状态查询成功
```

## 🔍 调试技巧

### 查看后台日志
```
chrome://extensions/
→ GitHub Cookie Helper
→ Service Worker (蓝色链接)
→ 查看 Console 输出
```

### 查看存储数据
```javascript
// 在 Service Worker Console 执行:
chrome.storage.local.get(['maxApplyId'], (result) => {
  console.log('当前存储的 Apply ID:', result.maxApplyId);
});
```

### 手动触发 Apply ID 检测
```
1. 刷新 GitHub Education 页面
2. 观察 Service Worker 日志
3. 应看到新的 Apply ID 被捕获
```

### 清除存储的 Apply ID
```javascript
// 在 Service Worker Console 执行:
chrome.storage.local.remove('maxApplyId');
console.log('Apply ID 已清除');
```

## ✅ 预期结果

### Apply ID 捕获
- ✅ 访问 GitHub Education 页面时自动捕获
- ✅ 捕获到多个 Apply ID 时保存最大值
- ✅ Apply ID 存储到 chrome.storage.local
- ✅ 界面显示当前最大 Apply ID

### Cookie 获取
- ✅ 读取所有 `.github.com` Cookie
- ✅ 构建正确的 Cookie 字符串格式
- ✅ 自动复制到剪贴板

### GitVault 集成
- ✅ Cookie 和 Apply ID 可正常使用
- ✅ API 查询返回正确状态

## 🐛 常见问题排查

### 问题 1: 没有捕获到 Apply ID
**可能原因:**
- 页面未完全加载
- 扩展权限不足
- 后台服务未启动

**解决方案:**
```
1. 刷新 GitHub Education 页面
2. 检查 chrome://extensions/ 中扩展状态
3. 重新加载扩展
4. 查看 Service Worker 日志
```

### 问题 2: Apply ID 不是最新的
**可能原因:**
- 新申请未触发 API 请求
- 缓存问题

**解决方案:**
```
1. 硬刷新页面 (Ctrl + Shift + R)
2. 清除 chrome.storage 后重新访问
3. 关闭并重新打开 GitHub Education 页面
```

### 问题 3: 扩展无法加载
**可能原因:**
- manifest.json 格式错误
- 文件路径错误

**解决方案:**
```
1. 检查所有文件是否存在
2. 验证 manifest.json 语法
3. 查看 chrome://extensions/ 错误信息
```

## 📊 测试记录

### 测试环境
- Chrome 版本: ___________
- 操作系统: Windows
- GitVault 版本: 1.0.0
- 扩展版本: 1.0.0

### 测试结果
- [ ] 扩展安装成功
- [ ] Apply ID 自动捕获成功
- [ ] Apply ID 取最大值正确
- [ ] Cookie 获取成功
- [ ] GitVault 集成成功
- [ ] API 查询状态成功

### 测试数据示例
```
Apply ID 1: 1958995
Apply ID 2: 1958994
最大 Apply ID: 1958995 ✅

Cookie 长度: 约 2000+ 字符
API 查询结果: Status="Pending"
```

---

**测试完成后，请记录问题和建议！**
