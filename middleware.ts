import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('session');
  const isLoginPage = request.nextUrl.pathname === '/login';
  const isApiRoute = request.nextUrl.pathname.startsWith('/api');
  const isPortalPage = request.nextUrl.pathname === '/portal';

  // 如果是 API 路由，跳过中间件检查（在 API 内部处理）
  if (isApiRoute) {
    return NextResponse.next();
  }

  // 允许未登录用户访问 /portal 页面
  if (!session && (isLoginPage || isPortalPage)) {
    return NextResponse.next();
  }

  // 如果没有会话且不是登录页或 /portal，重定向到登录页
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 如果已登录且在登录页，重定向到首页
  if (session && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
