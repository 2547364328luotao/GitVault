import { NextRequest, NextResponse } from 'next/server';
import { getAllAccounts, createAccount, GitHubAccount } from '@/lib/db';

export async function GET() {
  try {
    const accounts = await getAllAccounts();
    return NextResponse.json(accounts);
  } catch (error) {
    console.error('Failed to fetch accounts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch accounts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 验证必填字段
    if (!body.email || !body.email_password || !body.github_username || !body.github_password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newAccount = await createAccount(body as Omit<GitHubAccount, 'id' | 'created_at' | 'updated_at'>);
    return NextResponse.json(newAccount, { status: 201 });
  } catch (error) {
    console.error('Failed to create account:', error);
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
}
