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
      // This is a generic error, something is wrong with the code exchange.
      console.error('Error exchanging code for session:', error);
      // Redirect to login with a generic error, avoiding the separate error page.
      return NextResponse.redirect(`${origin}/login?error=Authentication failed. Please try again.`);
    }

    if (isLogin && data.user) {
      const createdAt = new Date(data.user.created_at);
      const lastSignInAt = data.user.last_sign_in_at ? new Date(data.user.last_sign_in_at) : createdAt;

      // If created_at and last_sign_in_at are very close, it's a new user.
      // Supabase doesn't have a direct "is new user" flag on session, so we infer it.
      // A small time diff accounts for small delays.
      const isNewUser = Math.abs(createdAt.getTime() - lastSignInAt.getTime()) < 5000;

      if (isNewUser) { 
        // This is a login attempt by a non-registered user.
        // We must sign them out and redirect with an error.
        await supabase.auth.signOut();
        return NextResponse.redirect(`${origin}/login?error=This account is not registered. Please sign up.`);
      }
    }

    // For successful signups or successful logins by existing users.
    return NextResponse.redirect(`${origin}/dashboard`);
  }

  // Fallback for when there's no code.
  return NextResponse.redirect(`${origin}/login?error=Invalid authentication request.`);
}
