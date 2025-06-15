// client/src/lib/api.ts
export async function apiRequest<T = any>(
  path: string,
  payload: unknown
): Promise<T> {
  const base = import.meta.env.DEV
    ? 'http://localhost:8081'    // твојот backend URL
    : '';
  const res = await fetch(`${base}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json();
}
