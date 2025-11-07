import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL must be a Neon postgres connection string');
  }
  return neon(process.env.DATABASE_URL);
}

// 生成随机卡密
function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 16; i++) {
    if (i > 0 && i % 4 === 0) code += '-';
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// POST - 生成卡密
export async function POST(request: NextRequest) {
  try {
    const { accountId, expiresInDays = 30, maxUses = 1 } = await request.json();
    
    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      );
    }

    const sql = getDb();
    
    // 检查账号是否有 Copilot Pro 权益
    const account = await sql`
      SELECT copilot_pro_status FROM github_accounts WHERE id = ${accountId}
    `;
    
    if (account.length === 0) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }
    
    if (account[0].copilot_pro_status !== 'active') {
      return NextResponse.json(
        { error: 'Account does not have active Copilot Pro' },
        { status: 403 }
      );
    }

    // 生成唯一卡密
    let code = generateCode();
    let isUnique = false;
    
    while (!isUnique) {
      const existing = await sql`
        SELECT id FROM access_codes WHERE code = ${code}
      `;
      if (existing.length === 0) {
        isUnique = true;
      } else {
        code = generateCode();
      }
    }

    // 计算过期时间
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    // 创建卡密
    const result = await sql`
      INSERT INTO access_codes (code, account_id, expires_at, max_uses)
      VALUES (${code}, ${accountId}, ${expiresAt.toISOString()}, ${maxUses})
      RETURNING *
    `;

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error generating access code:', error);
    return NextResponse.json(
      { error: 'Failed to generate access code' },
      { status: 500 }
    );
  }
}

// GET - 获取账号的所有卡密
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const accountId = searchParams.get('accountId');

    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      );
    }

    const sql = getDb();
    const codes = await sql`
      SELECT * FROM access_codes 
      WHERE account_id = ${accountId}
      ORDER BY created_at DESC
    `;

    return NextResponse.json(codes);
  } catch (error) {
    console.error('Error fetching access codes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch access codes' },
      { status: 500 }
    );
  }
}
