# 🍪 GitHub Cookie Helper - Chrome 扩展

> 自动获取 GitHub Cookie 和 Apply ID，无需手动查找和复制！

## ✨ 功能特性

- ✅ **一键获取 Cookie** - 自动读取 GitHub 登录 Cookie
- ✅ **自动捕获 Apply ID** - 监听 GitHub Education API 请求，自动提取最大的 Apply ID
- ✅ **自动复制到剪贴板** - 点击即可复制，无需手动选择
- ✅ **实时预览** - 查看获取到的 Cookie 和 Apply ID
- ✅ **快速打开 GitVault** - 一键跳转到 GitVault 系统
- ✅ **美观的界面** - 紫色渐变 + 毛玻璃效果

## 📦 安装步骤

### Chrome 浏览器

1. **打开扩展管理页面**
   ```
   地址栏输入: chrome://extensions/
   或者: 菜单 → 更多工具 → 扩展程序
   ```

2. **开启开发者模式**
   - 在页面右上角找到"开发者模式"开关
   - 点击开启

3. **加载扩展**
   - 点击"加载已解压的扩展程序"按钮
   - 选择 `chrome-extension` 文件夹
   - 点击"选择文件夹"

4. **完成**
   - 扩展图标会出现在浏览器工具栏
   - 如果没有显示，点击拼图图标 🧩 固定扩展

### Edge 浏览器

1. **打开扩展管理页面**
   ```
   地址栏输入: edge://extensions/
   或者: 菜单 → 扩展 → 管理扩展
   ```

2. **开启开发人员模式**
   - 在页面左侧找到"开发人员模式"开关
   - 点击开启

3. **加载扩展**
   - 点击"加载解压缩的扩展"按钮
   - 选择 `chrome-extension` 文件夹
   - 点击"选择文件夹"

4. **完成**
   - 扩展图标会出现在浏览器工具栏

## 🚀 使用方法

### 第一步：获取 Apply ID

1. **访问 GitHub Education 页面**
   ```
   https://github.com/settings/education/benefits
   ```

2. **扩展自动工作**
   - 后台服务会自动监听 GitHub API 请求
   - 自动捕获所有 Apply ID（如 1958995、1958994）
   - 自动保存最大的 Apply ID

3. **获取 Apply ID**
   - 点击扩展图标
   - 点击"🔢 获取并复制 Apply ID"
   - Apply ID 自动复制到剪贴板并显示在界面上

### 第二步：获取 Cookie

1. **确保已登录 GitHub**
   - 访问 https://github.com 并登录

2. **获取 Cookie**
   - 点击扩展图标
   - 点击"📋 获取并复制 Cookie"
   - Cookie 自动复制到剪贴板

### 第三步：在 GitVault 中使用

1. **打开 GitVault**
   - 点击扩展中的"🚀 打开 GitVault"按钮
   - 或直接访问 http://localhost:3001

2. **创建/编辑账号**
   - 在"GitHub Cookie"字段粘贴 Cookie
   - 在"GitHub Apply ID"字段粘贴 Apply ID
   - 点击保存

3. **查询申请状态**
   - 点击"🔍 查询申请状态"按钮
   - 查看当前申请状态

## 📋 工作原理

### Cookie 获取
- 使用 Chrome Cookies API 读取 `.github.com` 域名的所有 Cookie
- 构建标准 Cookie 字符串格式
- 自动复制到剪贴板

### Apply ID 捕获
- 后台服务监听所有 GitHub 网络请求
- 匹配 URL 模式: `/settings/education/developer_pack_applications/metadata/{id}`
- 提取所有 Apply ID 并保存最大值
- 存储到本地供后续使用

### 自动化流程
```
用户访问 GitHub Education
    ↓
后台监听 API 请求
    ↓
提取 Apply ID (取最大值)
    ↓
存储到 chrome.storage
    ↓
用户点击按钮获取
    ↓
自动复制到剪贴板
```

## 🔐 安全说明

### 数据隐私
- ✅ 扩展**完全在本地运行**
- ✅ **不会上传**任何数据到服务器
- ✅ **不会发送**Cookie 到任何第三方
- ✅ 仅读取 GitHub 相关 Cookie
- ✅ 仅监听 GitHub Education 相关 API

### 权限说明
- `cookies` - 读取 GitHub Cookie
- `clipboardWrite` - 复制到剪贴板
- `webRequest` - 监听 GitHub API 请求（仅限 GitHub Education 相关）
- `host_permissions` - 仅限 `https://github.com/*`

### 开源透明
- 所有代码公开可见
- 可随时审查扩展行为
- 无混淆、无加密代码

## 🛠️ 技术栈

- **Manifest V3** - 最新的 Chrome 扩展规范
- **Service Worker** - 后台服务（background.js）
- **Popup UI** - 弹出界面（popup.html/js）
- **Chrome APIs**
  - `chrome.cookies` - Cookie 管理
  - `chrome.webRequest` - 网络请求监听
  - `chrome.storage` - 本地存储
  - `chrome.runtime` - 消息通信

## 📁 文件结构

```
chrome-extension/
├── manifest.json      # 扩展配置文件
├── background.js      # 后台服务（监听 API 请求）
├── popup.html         # 扩展界面
├── popup.js           # 界面逻辑
├── icon.svg           # 扩展图标
└── README.md          # 使用文档
```

## 🐛 常见问题

### Q: 为什么没有检测到 Apply ID？
**A:** 请确保：
1. 已访问 https://github.com/settings/education/benefits
2. 页面完全加载完成
3. 刷新页面重新加载（扩展会自动捕获请求）

### Q: Cookie 获取失败？
**A:** 请确保：
1. 已登录 GitHub
2. 浏览器允许扩展访问 Cookie
3. 没有其他扩展阻止 Cookie 访问

### Q: 如何更新扩展？
**A:** 
1. 修改代码后
2. 在 `chrome://extensions/` 点击扩展的"刷新"按钮
3. 重新打开扩展即可

### Q: Apply ID 不是最新的？
**A:**
1. 刷新 GitHub Education 页面
2. 点击"获取 Apply ID"按钮
3. 扩展会自动更新到最大值

## 📝 更新日志

### v1.0.0 (2025-11-10)
- ✅ 实现 Cookie 一键获取
- ✅ 实现 Apply ID 自动捕获（取最大值）
- ✅ 实现自动复制到剪贴板
- ✅ 添加美观的 UI 界面
- ✅ 添加实时预览功能
- ✅ 添加快速打开 GitVault 功能

## 💡 使用技巧

1. **固定扩展图标** - 点击拼图图标 🧩 将扩展固定到工具栏
2. **快捷键** - 可以在 `chrome://extensions/shortcuts` 设置快捷键
3. **定期更新** - 访问 GitHub Education 页面时自动更新 Apply ID
4. **批量操作** - 先获取 Cookie 和 Apply ID，再批量创建账号

## 📞 支持

如有问题或建议，请在 GitVault 项目中提交 Issue。

---

**Happy Coding! 🎉**
