import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

// 与 login route 保持一致
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');

/**
 * 验证会话令牌的有效性
 */
function validateSessionToken(token: string): boolean {
  try {
    const [payloadBase64, signature] = token.split('.');
    
    if (!payloadBase64 || !signature) {
      return false;
    }

    // 验证签名
    const hmac = crypto.createHmac('sha256', SESSION_SECRET);
    hmac.update(Buffer.from(payloadBase64, 'base64').toString());
    const expectedSignature = hmac.digest('hex');
    
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return false;
    }

    // 解析 payload
    const payload = Buffer.from(payloadBase64, 'base64').toString();
    const [username, timestamp] = payload.split(':');
    
    if (!username || !timestamp) {
      return false;
    }

    // 检查令牌是否过期(7天)
    const tokenAge = Date.now() - parseInt(timestamp);
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 天
    
    if (tokenAge > maxAge) {
      console.warn('[AUTH] Session token expired');
      return false;
    }

    return true;
  } catch (error) {
    console.error('[AUTH] Token validation error:', error);
    return false;
  }
}

export async function GET() {
  try {
    const session = cookies().get('session');
    
    if (!session?.value) {
      return NextResponse.json({ 
        authenticated: false,
        reason: 'No session cookie found'
      });
    }

    // 验证会话令牌
    const isValid = validateSessionToken(session.value);
    
    if (!isValid) {
      // 清除无效的 session cookie
      cookies().delete('session');
      return NextResponse.json({ 
        authenticated: false,
        reason: 'Invalid or expired session'
      });
    }

    return NextResponse.json({ 
      authenticated: true 
    });
  } catch (error) {
    console.error('[AUTH] Session check error:', error);
    return NextResponse.json({ 
      authenticated: false,
      reason: 'Server error'
    });
  }
}
