import { type NextRequest } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images, mock-generations, or generations under public directory
     */
    '/((?!_next/static|_next/image|favicon.ico|mock-generations|generations|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
