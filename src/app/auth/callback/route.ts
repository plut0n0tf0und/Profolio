import { createSupabaseServerClient } from '@/lib/supabase-server';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // The is_login flag is added to the URL from the auth-form on the login page
  const isLogin = searchParams.get('is_login') === 'true';

  if (code) {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error('Error exchanging code for session:', error);
      // If there's an error, redirect to a generic error page or back to login
      return NextResponse.redirect(`${origin}/login?error=Authentication failed. Please try again.`);
    }

    // This is the crucial check:
    // If the user was trying to log in (not sign up) and a new user was created.
    if (isLogin && data.user) {
      // Supabase sets last_sign_in_at to the same value as created_at on initial signup.
      // We check if the timestamps are very close (e.g., within 5 seconds) to determine if it's a new user.
      const createdAt = new Date(data.user.created_at);
      const lastSignInAt = data.user.last_sign_in_at ? new Date(data.user.last_sign_in_at) : createdAt;

      const isNewUser = Math.abs(createdAt.getTime() - lastSignInAt.getTime()) < 5000; // 5-second threshold

      if (isNewUser) { 
        // If it's a new user from the login page, sign them out immediately.
        await supabase.auth.signOut();
        // Redirect back to the login page with a specific error.
        return NextResponse.redirect(`${origin}/login?error=This account is not registered. Please sign up.`);
      }
    }

    // For successful logins or any signups, redirect to the dashboard.
    return NextResponse.redirect(`${origin}/dashboard`);
  }

  // If there's no code, it's an invalid request.
  return NextResponse.redirect(`${origin}/login?error=Invalid authentication request.`);
}
