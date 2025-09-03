import { createSupabaseServerClient } from '@/lib/supabase-server';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const isLogin = searchParams.get('is_login') === 'true';

  if (!code) {
    const errorMessage = encodeURIComponent(
      'Invalid authentication request. Could not process login.'
    );
    return NextResponse.redirect(`${origin}/login?error=${errorMessage}`);
  }

  const supabase = createSupabaseServerClient();

  // Exchange OAuth code for session (temporary)
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error('Error exchanging code for session:', error);
    const errorMessage = encodeURIComponent('Authentication failed. Please try again.');
    return NextResponse.redirect(`${origin}/login?error=${errorMessage}`);
  }

  // If login attempt, check if user already exists in Supabase
  if (isLogin && data.user?.email) {
    const { data: existingUser, error: userError } = await supabase
      .from('users') // Or 'profiles' if you use a separate table
      .select('id')
      .eq('email', data.user.email)
      .single();

    if (userError || !existingUser) {
      // Abort login for non-registered users
      await supabase.auth.signOut();
      const errorMessage = encodeURIComponent(
        'This account is not registered. Please sign up first.'
      );
      return NextResponse.redirect(`${origin}/login?error=${errorMessage}`);
    }
  }

  // Login success or signup flow
  return NextResponse.redirect(`${origin}/dashboard`);
}
