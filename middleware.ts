import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 与 auth routes 保持一致
const SESSION_SECRET = process.env.SESSION_SECRET || 'default-secret-key-change-in-production';

/**
 * 将十六进制字符串转换为 Uint8Array (Edge Runtime 兼容)
 */
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

/**
 * 常量时间比较两个字符串 (Edge Runtime 兼容)
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
}

/**
 * 使用 Web Crypto API 验证 HMAC 签名 (Edge Runtime 兼容)
 */
async function verifyHmacSignature(payload: string, signature: string, secret: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    
    // 导入密钥
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign', 'verify']
    );
    
    // 计算预期签名
    const data = encoder.encode(payload);
    const signatureBuffer = await crypto.subtle.sign('HMAC', key, data);
    const signatureArray = Array.from(new Uint8Array(signatureBuffer));
    const expectedSignature = signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // 常量时间比较
    return timingSafeEqual(signature, expectedSignature);
  } catch (error) {
    return false;
  }
}

/**
 * 验证会话令牌的有效性 (Edge Runtime 兼容)
 */
async function validateSessionToken(token: string): Promise<boolean> {
  try {
    const [payloadBase64, signature] = token.split('.');
    
    if (!payloadBase64 || !signature) {
      return false;
    }

    // Base64 解码 payload
    const payload = atob(payloadBase64);
    
    // 验证签名
    const isValidSignature = await verifyHmacSignature(payload, signature, SESSION_SECRET);
    if (!isValidSignature) {
      return false;
    }

    // 解析 payload
    const [username, timestamp] = payload.split(':');
    
    if (!username || !timestamp) {
      return false;
    }

    // 检查令牌是否过期(7天)
    const tokenAge = Date.now() - parseInt(timestamp);
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 天
    
    return tokenAge <= maxAge;
  } catch (error) {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('session');
  const isLoginPage = request.nextUrl.pathname === '/login';
  const isApiRoute = request.nextUrl.pathname.startsWith('/api');

  // 公开访问的 API 路由
  const publicApiRoutes = [
    '/api/auth/login', 
    '/api/auth/check',
    '/api/access-codes/verify' // 卡密验证 API 公开访问
  ];
  const isPublicApiRoute = publicApiRoutes.some(route => 
    request.nextUrl.pathname === route
  );

  // API 路由处理
  if (isApiRoute) {
    // 公开 API 路由允许访问
    if (isPublicApiRoute) {
      return NextResponse.next();
    }
    
    // 其他 API 路由需要验证会话
    const isValid = sessionCookie?.value ? await validateSessionToken(sessionCookie.value) : false;
    if (!isValid) {
      return NextResponse.json(
        { error: 'Unauthorized', message: '请先登录' },
        { status: 401 }
      );
    }
    
    return NextResponse.next();
  }

  // 页面路由处理
  const isAuthenticated = sessionCookie?.value ? await validateSessionToken(sessionCookie.value) : false;
  const isPortalPage = request.nextUrl.pathname === '/portal';

  // 允许未登录用户访问登录页和 Portal 页面
  if (!isAuthenticated && (isLoginPage || isPortalPage)) {
    return NextResponse.next();
  }

  // 未登录用户重定向到登录页
  if (!isAuthenticated) {
    console.warn(`[AUTH] Unauthorized access attempt to: ${request.nextUrl.pathname}`);
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 已登录用户访问登录页,重定向到首页
  if (isAuthenticated && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * 匹配所有路径,除了:
     * - _next/static (静态文件)
     * - _next/image (图片优化)
     * - favicon.ico (网站图标)
     * - public 文件夹中的文件
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
