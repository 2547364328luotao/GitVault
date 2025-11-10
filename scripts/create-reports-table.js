// 创建认证报告表
const fs = require('fs');
const path = require('path');
const { neon } = require('@neondatabase/serverless');

// 手动加载 .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  }
});

const databaseUrl = envVars.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL not found in .env.local');
  process.exit(1);
}

async function createReportsTable() {
  const sql = neon(databaseUrl);

  try {
    console.log('🔄 开始创建认证报告表...');

    // 创建认证报告表
    await sql`
      CREATE TABLE IF NOT EXISTS verification_reports (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        gender VARCHAR(20) NOT NULL,
        birth_date VARCHAR(50) NOT NULL,
        ethnicity VARCHAR(50) NOT NULL,
        institution_name VARCHAR(255) NOT NULL,
        level VARCHAR(50) NOT NULL,
        major VARCHAR(100) NOT NULL,
        duration VARCHAR(50) NOT NULL,
        education_type VARCHAR(100) NOT NULL,
        learning_form VARCHAR(100) NOT NULL,
        branch VARCHAR(100),
        department VARCHAR(100),
        admission_date VARCHAR(50) NOT NULL,
        status VARCHAR(100) NOT NULL,
        graduation_date VARCHAR(50) NOT NULL,
        photo_url TEXT,
        verification_code VARCHAR(50) NOT NULL,
        qr_code_url TEXT,
        update_date VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log('✓ verification_reports 表已创建');

    // 创建索引
    await sql`
      CREATE INDEX IF NOT EXISTS idx_reports_name 
      ON verification_reports(name)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_reports_verification_code 
      ON verification_reports(verification_code)
    `;

    console.log('✓ 索引已创建');

    // 验证表结构
    const tableInfo = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'verification_reports'
      ORDER BY ordinal_position
    `;

    console.log('\n✓ 迁移成功!');
    console.log('\n表结构:');
    tableInfo.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });

  } catch (error) {
    console.error('❌ 迁移失败:', error);
    process.exit(1);
  }
}

createReportsTable();
