# 账号切换自动清空 Apply ID 功能

## 🎯 功能说明

当检测到 GitHub 账号切换时,扩展会**自动清空**之前保存的 Apply ID,避免不同账号之间的数据混淆。

## 🔄 工作原理

### 1. 用户名检测 (content.js)

扩展使用 3 种方法检测当前登录的 GitHub 用户名:

```javascript
// 方法1: 从 meta 标签获取
<meta name="user-login" content="username">

// 方法2: 从头像链接获取
<img alt="@username">

// 方法3: 从用户菜单按钮获取
<button data-login="username">
```

### 2. 账号切换检测

- 每次页面加载时,扩展会:
  1. 获取当前登录的用户名
  2. 从 storage 读取上次保存的用户名
  3. 比较两个用户名是否一致

- 如果检测到用户名不同:
  ```
  旧用户: user1 → 新用户: user2
  ```
  扩展会自动执行:
  - 清空本地缓存的 Apply ID Set
  - 通知 background 清空 storage 中的 Apply ID
  - 保存新的用户名

### 3. 自动清空时机

账号切换自动检测发生在:
- ✅ Content Script 注入时(立即检测)
- ✅ 页面完全加载后(再次确认)
- ✅ 访问 GitHub Education 页面时

### 4. 控制台日志

```javascript
// 首次检测
[GitHub Cookie Helper] 首次检测到用户: username1

// 账号未变化
[GitHub Cookie Helper] 用户未变化: username1

// 账号切换
[GitHub Cookie Helper] 检测到账号切换: username1 -> username2
[GitHub Cookie Helper] 清空旧的 Apply ID
[GitHub Cookie Helper] Apply ID 已清空
[GitHub Cookie Helper] 已保存当前用户名: username2
```

## 🎨 UI 更新

### Popup 界面新增功能

1. **用户名显示**
   ```
   👤 当前用户: username
   ```
   - 显示当前登录的 GitHub 用户名
   - 紫色渐变背景,醒目提示

2. **清空按钮**
   ```
   [🔢 获取 Apply ID] [🗑️ 清空]
   ```
   - 手动清空 Apply ID 按钮
   - 红色渐变背景(danger 样式)
   - 点击前需要确认

## 📝 使用场景

### 场景 1: 正常使用单账号

```
1. 登录 GitHub (user1)
2. 访问 Education 页面
3. 扩展捕获 Apply ID: 1958995
4. 下次访问,Apply ID 保持不变
```

控制台:
```
[GitHub Cookie Helper] 首次检测到用户: user1
[GitHub Cookie Helper] 检测到 Apply ID: 1958995
```

### 场景 2: 切换到其他账号

```
1. 登录 GitHub (user1)
2. Apply ID: 1958995
3. 退出登录
4. 登录 GitHub (user2)
5. Apply ID 自动清空
6. 访问 Education 页面
7. 扩展捕获新 Apply ID: 2000123
```

控制台:
```
[GitHub Cookie Helper] 检测到账号切换: user1 -> user2
[GitHub Cookie Helper] 清空旧的 Apply ID
[GitHub Cookie Helper] 检测到 Apply ID: 2000123
```

### 场景 3: 手动清空 Apply ID

```
1. 点击扩展图标
2. 点击 [🗑️ 清空] 按钮
3. 确认对话框: "确定要清空当前的 Apply ID 吗？"
4. 点击 [确定]
5. Apply ID 被清空
```

UI 提示:
```
✅ Apply ID 已清空
```

## 🔍 调试方法

### 1. 检查当前用户名

```javascript
// 在 GitHub 页面控制台运行
chrome.storage.local.get(['lastUsername'], console.log)

// 输出: { lastUsername: "username" }
```

### 2. 手动触发账号切换检测

```javascript
// 在 GitHub 页面控制台运行
chrome.storage.local.set({ lastUsername: 'testuser' }, () => {
  console.log('已设置测试用户名');
  location.reload(); // 重新加载页面触发检测
});
```

### 3. 查看账号切换日志

```
F12 → Console → 筛选: "GitHub Cookie Helper"
```

查找以下日志:
- "检测到账号切换" - 账号已切换
- "用户未变化" - 账号未变化
- "清空旧的 Apply ID" - Apply ID 已清空

## ⚙️ 存储结构

### chrome.storage.local

```javascript
{
  maxApplyId: 1958995,      // 当前最大 Apply ID
  lastUsername: "username"   // 上次登录的用户名
}
```

## 🚀 测试步骤

1. **重新加载扩展**
   ```
   chrome://extensions/ → 找到扩展 → 点击 🔄
   ```

2. **测试账号切换**
   - 访问 https://github.com/settings/education/benefits
   - 查看控制台,确认用户名被检测
   - 退出登录
   - 登录另一个账号
   - 再次访问,确认 Apply ID 已清空

3. **测试手动清空**
   - 点击扩展图标
   - 查看当前用户名显示
   - 点击 [🗑️ 清空] 按钮
   - 确认 Apply ID 被清空

## 📊 功能清单

- ✅ 自动检测 GitHub 用户名
- ✅ 检测账号切换
- ✅ 自动清空旧账号的 Apply ID
- ✅ 保存当前用户名到 storage
- ✅ Popup 显示当前用户名
- ✅ 手动清空 Apply ID 按钮
- ✅ 清空前确认对话框
- ✅ 详细的控制台日志
- ✅ 多重检测时机保证准确性

## 🎉 完成!

现在扩展已经具备完整的账号切换检测功能,当你切换 GitHub 账号时,Apply ID 会自动清空,不会出现数据混淆的问题! 🚀
