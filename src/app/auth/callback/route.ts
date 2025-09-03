import { createSupabaseServerClient } from '@/lib/supabase-server';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const isLogin = searchParams.get('is_login') === 'true';

  if (code) {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error('Error exchanging code for session:', error);
      return NextResponse.redirect(`${origin}/login?error=Authentication failed. Please try again.`);
    }

    if (isLogin && data.user) {
      const createdAt = new Date(data.user.created_at);
      const lastSignInAt = data.user.last_sign_in_at ? new Date(data.user.last_sign_in_at) : createdAt;

      const isNewUser = Math.abs(createdAt.getTime() - lastSignInAt.getTime()) < 5000;

      if (isNewUser) { 
        await supabase.auth.signOut();
        return NextResponse.redirect(`${origin}/login?error=This account is not registered. Please sign up.`);
      }
    }

    return NextResponse.redirect(`${origin}/dashboard`);
  }

  return NextResponse.redirect(`${origin}/login?error=Invalid authentication request.`);
}
