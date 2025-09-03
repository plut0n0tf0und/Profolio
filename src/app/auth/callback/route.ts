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
      const errorMessage = encodeURIComponent('Authentication failed. Please try again.');
      return NextResponse.redirect(`${origin}/login?error=${errorMessage}`);
    }

    if (isLogin && data.user) {
      // Supabase sets last_sign_in_at to the same value as created_at on initial signup.
      // We check if the timestamps are very close (e.g., within 5 seconds) to determine if it's a new user.
      const createdAt = new Date(data.user.created_at);
      const lastSignInAt = data.user.last_sign_in_at ? new Date(data.user.last_sign_in_at) : createdAt;

      const isNewUser = Math.abs(createdAt.getTime() - lastSignInAt.getTime()) < 5000; // 5-second threshold

      if (isNewUser) { 
        // If a new user was created during a login attempt, sign them out immediately.
        await supabase.auth.signOut();
        // Redirect back to the login page with a specific error.
        const errorMessage = encodeURIComponent('This account is not registered. Please sign up.');
        return NextResponse.redirect(`${origin}/login?error=${errorMessage}`);
      }
    }

    // For successful logins or any signups, redirect to the dashboard.
    return NextResponse.redirect(`${origin}/dashboard`);
  }

  // If there's no code, it's an invalid request.
  const errorMessage = encodeURIComponent('Invalid authentication request.');
  return NextResponse.redirect(`${origin}/login?error=${errorMessage}`);
}
