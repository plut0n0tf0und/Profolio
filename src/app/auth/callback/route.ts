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
      return NextResponse.redirect(`${origin}/auth/auth-code-error`);
    }

    if (isLogin && data.user) {
      const createdAt = new Date(data.user.created_at);
      const lastSignInAt = data.user.last_sign_in_at ? new Date(data.user.last_sign_in_at) : createdAt;

      // If created_at and last_sign_in_at are very close, it's likely a new user.
      // Supabase doesn't have a direct "is new user" flag on the session, so we infer it.
      // The time diff is generous to account for small delays.
      if (Math.abs(createdAt.getTime() - lastSignInAt.getTime()) < 5000) { 
        await supabase.auth.signOut();
        return NextResponse.redirect(`${origin}/login?error=Account not registered. Please sign up first.`);
      }
    }

    return NextResponse.redirect(`${origin}/dashboard`);
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
