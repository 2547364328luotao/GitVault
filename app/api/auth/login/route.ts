import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

// 从环境变量获取管理员凭证
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'change_this_password';

// 生成安全的会话密钥
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');

/**
 * 生成安全的会话令牌
 */
function generateSessionToken(username: string): string {
  const timestamp = Date.now();
  const randomBytes = crypto.randomBytes(16).toString('hex');
  const payload = `${username}:${timestamp}:${randomBytes}`;
  
  // 使用 HMAC 签名确保令牌不可伪造
  const hmac = crypto.createHmac('sha256', SESSION_SECRET);
  hmac.update(payload);
  const signature = hmac.digest('hex');
  
  return `${Buffer.from(payload).toString('base64')}.${signature}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // 防止暴力破解:添加延迟
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 验证输入
    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: '用户名和密码不能为空' },
        { status: 400 }
      );
    }

    // 验证用户名和密码(使用常量时间比较防止时序攻击)
    const usernameMatch = crypto.timingSafeEqual(
      Buffer.from(username),
      Buffer.from(ADMIN_USERNAME)
    );
    const passwordMatch = crypto.timingSafeEqual(
      Buffer.from(password),
      Buffer.from(ADMIN_PASSWORD)
    );

    if (usernameMatch && passwordMatch) {
      // 生成安全的会话令牌
      const sessionToken = generateSessionToken(username);
      
      // 设置安全的 HTTP-only cookie
      cookies().set('session', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict', // 更严格的 CSRF 保护
        maxAge: 60 * 60 * 24 * 7, // 7 天
        path: '/',
      });

      // 记录成功登录
      console.log(`[AUTH] Successful login: ${username} at ${new Date().toISOString()}`);

      return NextResponse.json({ 
        success: true, 
        message: '登录成功' 
      });
    } else {
      // 记录失败尝试
      console.warn(`[AUTH] Failed login attempt for username: ${username} at ${new Date().toISOString()}`);
      
      return NextResponse.json(
        { success: false, message: '用户名或密码错误' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('[AUTH] Login error:', error);
    return NextResponse.json(
      { success: false, message: '登录失败,请重试' },
      { status: 500 }
    );
  }
}
