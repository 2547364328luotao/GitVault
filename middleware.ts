import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import crypto from 'crypto';

// 与 auth routes 保持一致
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
    
    return tokenAge <= maxAge;
  } catch (error) {
    return false;
  }
}

export function middleware(request: NextRequest) {
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
    if (!sessionCookie?.value || !validateSessionToken(sessionCookie.value)) {
      return NextResponse.json(
        { error: 'Unauthorized', message: '请先登录' },
        { status: 401 }
      );
    }
    
    return NextResponse.next();
  }

  // 页面路由处理
  const isAuthenticated = sessionCookie?.value && validateSessionToken(sessionCookie.value);
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
