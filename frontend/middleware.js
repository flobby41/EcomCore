import { NextResponse } from 'next/server';

export function middleware(request) {
    // Protéger toutes les routes admin sauf login
    if (request.nextUrl.pathname.startsWith('/admin') && 
        !request.nextUrl.pathname.includes('/admin/login')) {
        
        const adminToken = request.cookies.get('adminToken');
console.log('admintoken coté middleware : ', adminToken)
        if (!adminToken) {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/admin/:path*'
}; 