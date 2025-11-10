// 添加 github_cookie 字段到 github_accounts 表
// 运行: node scripts/add-github-cookie-field.js

const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function addGithubCookieField() {
  const sql = neon(process.env.DATABASE_URL);
  
  try {
    console.log('正在添加 github_cookie 字段...');
    
    // 检查字段是否已存在
    const checkResult = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'github_accounts' 
      AND column_name = 'github_cookie'
    `;
    
    if (checkResult.length > 0) {
      console.log('✅ github_cookie 字段已存在');
      return;
    }
    
    // 添加字段
    await sql`
      ALTER TABLE github_accounts 
      ADD COLUMN github_cookie TEXT
    `;
    
    console.log('✅ 成功添加 github_cookie 字段');
    
  } catch (error) {
    console.error('❌ 错误:', error);
    throw error;
  }
}

addGithubCookieField()
  .then(() => {
    console.log('\n✨ 数据库更新完成!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 数据库更新失败:', error);
    process.exit(1);
  });
