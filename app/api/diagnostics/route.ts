import { NextResponse } from 'next/server';

/**
 * 诊断 API - 检查环境变量和 IMAP 连接
 */
export async function GET() {
  try {
    // 检查环境变量
    const diagnostics = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      imapConfig: {
        user: process.env.IMAP_USER ? '✅ 已配置' : '❌ 未配置',
        password: process.env.IMAP_PASSWORD ? '✅ 已配置' : '❌ 未配置',
        host: process.env.IMAP_HOST || '使用默认值',
        port: process.env.IMAP_PORT || '使用默认值',
      },
      actualValues: {
        user: process.env.IMAP_USER,
        host: process.env.IMAP_HOST,
        port: process.env.IMAP_PORT,
        // 不要输出密码,只显示前3个字符
        passwordPrefix: process.env.IMAP_PASSWORD?.substring(0, 3) + '***',
      }
    };

    return NextResponse.json(diagnostics);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
