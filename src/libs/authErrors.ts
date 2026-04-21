export const getAuthErrorMessage = (error: unknown): string => {
  if (!(error instanceof Error)) {
    return 'Authentication failed. Please try again.';
  }

  const message = error.message || '';
  const normalized = message.toLowerCase();

  if (
    normalized.includes('failed to fetch') ||
    normalized.includes('networkerror') ||
    normalized.includes('load failed')
  ) {
    return 'Unable to reach authentication server. Check your internet/DNS and verify NEXT_PUBLIC_SUPABASE_URL points to an active Supabase project.';
  }

  if (normalized.includes('invalid login credentials')) {
    return 'Invalid email or password.';
  }

  return message;
};
