async function request(path: string, opts: RequestInit = {}) {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(opts.headers as any) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(path, { ...opts, headers });
  if (!res.ok) throw new Error((await res.json().catch(() => ({ error: 'Erro' }))).error);
  return res.json();
}
export const api = { get: (p: string) => request(p), post: (p: string, b?: any) => request(p, { method: 'POST', body: JSON.stringify(b) }), put: (p: string, b?: any) => request(p, { method: 'PUT', body: JSON.stringify(b) }), delete: (p: string) => request(p, { method: 'DELETE' }) };
