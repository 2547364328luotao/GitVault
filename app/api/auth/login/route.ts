import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// 硬编码的用户凭证
const VALID_USERNAME = 'luotao';
const VALID_PASSWORD = '20050508luo';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // 验证用户名和密码
    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      // 创建一个简单的会话 token
      const sessionToken = Buffer.from(`${username}:${Date.now()}`).toString('base64');
      
      // 设置 cookie
      cookies().set('session', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 天
        path: '/',
      });

      return NextResponse.json({ 
        success: true, 
        message: '登录成功' 
      });
    } else {
      return NextResponse.json(
        { success: false, message: '用户名或密码错误' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: '登录失败，请重试' },
      { status: 500 }
    );
  }
}
