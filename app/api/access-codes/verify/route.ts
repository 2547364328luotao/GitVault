import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL must be a Neon postgres connection string');
  }
  return neon(process.env.DATABASE_URL);
}

// POST - 验证卡密并获取账号信息
export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();
    
    if (!code) {
      return NextResponse.json(
        { error: 'Access code is required' },
        { status: 400 }
      );
    }

    const sql = getDb();
    
    // 查找卡密
    const accessCodes = await sql`
      SELECT * FROM access_codes WHERE code = ${code}
    `;

    if (accessCodes.length === 0) {
      return NextResponse.json(
        { error: 'Invalid access code' },
        { status: 404 }
      );
    }

    const accessCode = accessCodes[0];

    // 检查是否过期
    if (accessCode.expires_at && new Date(accessCode.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Access code has expired' },
        { status: 403 }
      );
    }

    // 检查使用次数
    if (accessCode.used_count >= accessCode.max_uses) {
      return NextResponse.json(
        { error: 'Access code has reached maximum uses' },
        { status: 403 }
      );
    }

    // 获取账号信息
    const accounts = await sql`
      SELECT id, email, email_password, email_phone, github_username, github_password, 
             github_name, github_recovery_codes, copilot_pro_status, created_at
      FROM github_accounts 
      WHERE id = ${accessCode.account_id}
    `;

    if (accounts.length === 0) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    // 增加使用次数
    await sql`
      UPDATE access_codes 
      SET used_count = used_count + 1, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${accessCode.id}
    `;

    return NextResponse.json({
      account: accounts[0],
      accessCode: {
        usedCount: accessCode.used_count + 1,
        maxUses: accessCode.max_uses,
        expiresAt: accessCode.expires_at
      }
    });
  } catch (error) {
    console.error('Error verifying access code:', error);
    return NextResponse.json(
      { error: 'Failed to verify access code' },
      { status: 500 }
    );
  }
}
