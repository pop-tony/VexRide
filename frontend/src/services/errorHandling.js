export function logError(context, error) {
  console.error(`[${context}]`, error);
}

export function friendlyError(error, fallback = 'Something went wrong. Please try again.') {
  const message = String(error?.message || '').toLowerCase();

  if (!message || message.includes('network') || message.includes('failed to fetch')) {
    return 'Unable to connect right now. Please check your connection and try again.';
  }
  if (message.includes('sign in') || message.includes('unauthorized') || message.includes('invalid credentials')) {
    return 'Please sign in again to continue.';
  }
  if (message.includes('not found')) return 'We could not find what you requested.';
  if (message.includes('already')) return 'This action has already been completed.';
  if (message.includes('required') || message.includes('invalid')) {
    return 'Please check your information and try again.';
  }

  return fallback;
}
