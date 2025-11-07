import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const session = cookies().get('session');
    
    return NextResponse.json({ 
      authenticated: !!session?.value 
    });
  } catch (error) {
    return NextResponse.json({ authenticated: false });
  }
}
