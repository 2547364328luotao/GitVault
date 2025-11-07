import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    // 删除会话 cookie
    cookies().delete('session');
    
    return NextResponse.json({ 
      success: true, 
      message: '退出成功' 
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, message: '退出失败' },
      { status: 500 }
    );
  }
}
