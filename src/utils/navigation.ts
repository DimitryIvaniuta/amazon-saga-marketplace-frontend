/** Prevents router state from becoming an external or protocol-relative redirect. */
export function safeInternalPath(value: unknown, fallback = '/'): string {
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') ? value : fallback;
}
