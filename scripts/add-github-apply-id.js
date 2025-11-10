/**
 * 数据库迁移脚本：添加 github_apply_id 字段
 * 用于存储 GitHub Education 申请ID，配合新的 API 查询申请状态
 * 
 * 运行方式：node scripts/add-github-apply-id.js
 */

import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// 获取当前文件所在目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 加载 .env.local 文件
dotenv.config({ path: join(__dirname, '..', '.env.local') });

async function addGitHubApplyIdField() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ 错误: 未找到 DATABASE_URL 环境变量');
    console.error('请确保 .env.local 文件存在并包含 DATABASE_URL');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    console.log('🔄 开始添加 github_apply_id 字段...');

    // 检查字段是否已存在
    const checkResult = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'github_accounts' 
      AND column_name = 'github_apply_id'
    `;

    if (checkResult.length > 0) {
      console.log('ℹ️  字段 github_apply_id 已存在，跳过创建');
      return;
    }

    // 添加新字段
    await sql`
      ALTER TABLE github_accounts 
      ADD COLUMN github_apply_id VARCHAR(255)
    `;

    console.log('✅ 成功添加 github_apply_id 字段');
    console.log('');
    console.log('📋 字段说明：');
    console.log('   - github_apply_id: GitHub Education 申请ID');
    console.log('   - 示例值: 12345678');
    console.log('   - 用途: 配合新的 metadata API 查询申请状态');
    console.log('');
    console.log('🔗 API 端点格式：');
    console.log('   https://github.com/settings/education/developer_pack_applications/metadata/{apply_id}');
    console.log('');

  } catch (error) {
    console.error('❌ 添加字段失败:', error);
    process.exit(1);
  }
}

addGitHubApplyIdField();
