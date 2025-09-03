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
      const createdAt = new Date(data.user.created_at);
      const lastSignInAt = data.user.last_sign_in_at ? new Date(data.user.last_sign_in_at) : createdAt;
      
      // A user is considered "new" if they signed in within 5 seconds of being created.
      // This is a reliable way to detect if Supabase just created the account via OAuth.
      const isNewUser = Math.abs(createdAt.getTime() - lastSignInAt.getTime()) < 5000;

      if (isNewUser) { 
        // If a new user was created during a login attempt, this is an error.
        // We sign them out to invalidate the session and redirect with an error.
        await supabase.auth.signOut();
        const errorMessage = encodeURIComponent('This account is not registered. Please sign up.');
        return NextResponse.redirect(`${origin}/login?error=${errorMessage}`);
      }
    }
    
    // For successful logins or any sign-ups, redirect to the dashboard.
    return NextResponse.redirect(`${origin}/dashboard`);
  }

  // Fallback for any other issues, like a missing code.
  const errorMessage = encodeURIComponent('Invalid authentication request. Could not process login.');
  return NextResponse.redirect(`${origin}/login?error=${errorMessage}`);
}
