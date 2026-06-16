import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  const session = request.cookies.get('admin_session')?.value;
  const validToken = process.env.ADMIN_SESSION_TOKEN;

  if (!session || session !== validToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', 'unauthenticated');
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
