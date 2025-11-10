# GitHub Education 申请状态查询功能重构指南

## 📌 重构概述

原 API 方式：解析 HTML 页面 `https://github.com/settings/education/benefits`  
新 API 方式：直接查询 metadata 端点 `https://github.com/settings/education/developer_pack_applications/metadata/{apply_id}`

**优势：**
- ✅ 更简单：只需提供 `apply_id` 和 `cookie` 两个参数
- ✅ 更快速：直接获取 JSON 数据，无需解析 HTML
- ✅ 更可靠：API 端点更稳定，不受页面改版影响
- ✅ 更精确：直接获取申请 ID 对应的具体状态

## 🔧 已完成的修改

### 1. 数据库字段添加

**文件：** `scripts/add-github-apply-id.js`

```bash
# 运行此脚本添加 github_apply_id 字段
node scripts/add-github-apply-id.js
```

**SQL 变更：**
```sql
ALTER TABLE github_accounts 
ADD COLUMN github_apply_id VARCHAR(255);
```

### 2. API 端点重构

**文件：** `app/api/check-education/route.ts`

**变更内容：**
- 新增参数：`applyId` (必需)
- API 端点：`https://github.com/settings/education/developer_pack_applications/metadata/${applyId}`
- 返回格式：
  ```json
  {
    "success": true,
    "status": "approved" | "rejected" | "pending" | "processing",
    "school": "学校名称",
    "submittedAt": "提交时间",
    "message": "友好的状态消息"
  }
  ```

### 3. 数据库接口更新

**文件：** `lib/db.ts`

**变更内容：**
- `GitHubAccount` interface 新增 `github_apply_id?: string`
- `createAccount` 函数支持 `github_apply_id` 字段
- `updateAccount` 函数支持 `github_apply_id` 字段更新

## 📝 需要手动完成的前端修改

### 待修改文件清单：

#### 1. `components/AccountForm.tsx`

**需要添加的内容：**

1. 在 `formData` state 中添加：
```typescript
github_apply_id: '',
```

2. 在所有 `setFormData` 调用中添加：
```typescript
github_apply_id: '',  // 或从 editingAccount 读取
```

3. 在表单中添加输入框（在 GitHub Cookie 输入框之后）：
```tsx
{/* GitHub 申请ID */}
<div>
  <label className="block text-sm font-medium mb-2">
    GitHub 申请ID
    <span className="text-xs text-gray-500 ml-2">
      (可选，用于查询申请状态)
    </span>
  </label>
  <input
    type="text"
    value={formData.github_apply_id}
    onChange={(e) => setFormData({ ...formData, github_apply_id: e.target.value })}
    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
    placeholder="例如: 12345678"
  />
  <p className="mt-1 text-xs text-gray-500">
    💡 如何获取: 访问 GitHub Education 申请页面，URL 中的数字即为申请ID
  </p>
</div>
```

#### 2. `components/AccountList.tsx`

**需要修改的内容：**

1. 修改 `checkEducationStatus` 函数调用 API 时传递 `applyId`：

```typescript
const checkEducationStatus = async (
  accountId: number, 
  githubCookie: string | undefined,
  githubApplyId: string | undefined
) => {
  if (!githubApplyId || githubApplyId.trim() === '') {
    alert(
      '❌ 该账号未设置 GitHub 申请ID\n\n' +
      '📋 操作步骤：\n' +
      '1. 点击【编辑】按钮\n' +
      '2. 在 GitHub 申请ID 输入框中填写申请ID\n' +
      '3. 申请ID 可以从 GitHub Education 申请页面 URL 获取\n' +
      '4. 保存后即可查询申请状态'
    );
    return;
  }

  if (!githubCookie || githubCookie.trim() === '') {
    alert('❌ 该账号未设置 GitHub Cookie');
    return;
  }

  try {
    setCheckingEducation(prev => ({ ...prev, [accountId]: true }));
    const response = await fetch('/api/check-education', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        applyId: githubApplyId,
        cookie: githubCookie 
      })
    });

    // ... 其余处理逻辑
  } catch (error) {
    // ... 错误处理
  }
};
```

2. 修改查询按钮调用，传递 `github_apply_id`：

```tsx
<button
  onClick={() => checkEducationStatus(
    account.id!, 
    account.github_cookie,
    account.github_apply_id  // 新增参数
  )}
  className="..."
>
  查询申请状态
</button>
```

## 🧪 测试步骤

### 1. 运行数据库迁移
```bash
node scripts/add-github-apply-id.js
```

### 2. 更新前端代码
按照上述指南修改 `AccountForm.tsx` 和 `AccountList.tsx`

### 3. 启动开发服务器
```bash
npm run dev
```

### 4. 测试功能
1. 创建或编辑一个账号
2. 填写 GitHub Cookie 和申请ID
3. 保存后点击"查询申请状态"
4. 验证返回的状态信息

## 📖 如何获取 GitHub 申请ID

### 方法 1：从 URL 获取
1. 访问：https://github.com/settings/education
2. 点击您的申请
3. URL 格式：`https://github.com/settings/education/developer_pack_applications/{apply_id}`
4. `apply_id` 就是申请ID（通常是一串数字）

### 方法 2：从申请详情页面
1. 进入申请详情页
2. 查看浏览器地址栏
3. 最后一段路径即为申请ID

## ⚠️ 注意事项

1. **Cookie 仍然必需**：新 API 同样需要有效的 GitHub Cookie 进行身份验证
2. **申请ID 唯一性**：每个申请都有唯一的 ID
3. **代理配置**：中国大陆用户仍需配置代理访问 GitHub API
4. **错误处理**：
   - 404：申请ID不存在或无权访问
   - 401/403：Cookie 无效或已过期
   - 500：服务器错误或网络问题

## 🔗 相关文档

- [HOW_TO_CHECK_EDUCATION_STATUS.md](./HOW_TO_CHECK_EDUCATION_STATUS.md) - 用户操作指南
- [PROXY_TROUBLESHOOTING.md](./PROXY_TROUBLESHOOTING.md) - 代理配置指南
- [TESTING.md](./TESTING.md) - 测试工具使用说明

## 📊 新旧对比

| 对比项 | 旧方式 (HTML解析) | 新方式 (Metadata API) |
|--------|-------------------|----------------------|
| 参数   | 只需 Cookie | Cookie + Apply ID |
| 响应   | HTML 文本 | JSON 数据 |
| 解析   | 复杂的正则匹配 | 直接读取字段 |
| 稳定性 | 受页面改版影响 | API 更稳定 |
| 性能   | 较慢 | 更快 |
| 准确性 | 可能误判 | 精确匹配 |

## ✅ 完成清单

- [x] 创建数据库迁移脚本
- [x] 重构 API 端点
- [x] 更新数据库接口
- [ ] 更新前端表单组件
- [ ] 更新账号列表组件
- [ ] 运行数据库迁移
- [ ] 测试完整流程
- [ ] 更新用户文档

---

**最后更新：** 2025年11月10日  
**版本：** v2.0  
**变更类型：** 功能重构
