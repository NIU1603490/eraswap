let getTokenFn: (() => Promise<string | null>) | null = null;

export function registerTokenGetter(fn: () => Promise<string | null>) {
  getTokenFn = fn;
}

export async function fetchAuthToken(): Promise<string | null> {
  return getTokenFn ? await getTokenFn() : null;
}
