export function parseCookies(cookieHeader?: string): Record<string, string> {
  if (!cookieHeader) return {};
  return cookieHeader.split(';').reduce((acc: Record<string, string>, cookie: string) => {
    const [key, ...rest] = cookie.trim().split('=');
    if (key) acc[key] = rest.join('=');
    return acc;
  }, {});
}
