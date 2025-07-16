import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Простой редирект с корня на /en
  if (request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/en', request.url));
  }

  // Пропускаем все остальные запросы
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)', '/']
};
