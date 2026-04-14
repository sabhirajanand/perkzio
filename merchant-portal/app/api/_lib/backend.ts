import { NextResponse } from 'next/server';

export function getApiBaseUrl(): string {
  const base = process.env.API_BASE_URL ?? (process.env.NODE_ENV === 'development' ? 'http://localhost:4000' : '');
  if (!base) {
    throw new Error('API_BASE_URL is not set');
  }
  return base.replace(/\/+$/, '');
}

export async function proxyToBackend(input: {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
}) {
  let url: string;
  try {
    url = `${getApiBaseUrl()}${input.path.startsWith('/') ? '' : '/'}${input.path}`;
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Invalid API configuration';
    return { status: 500, ok: false, json: { message } };
  }

  try {
    const res = await fetch(url, {
      method: input.method,
      headers: {
        ...(input.body ? { 'Content-Type': 'application/json' } : {}),
        ...(input.headers || {}),
      },
      body: input.body ? JSON.stringify(input.body) : undefined,
      cache: 'no-store',
    });

    const text = await res.text();
    const json = text
      ? (() => {
          try {
            return JSON.parse(text) as unknown;
          } catch {
            return { message: text };
          }
        })()
      : null;
    return { status: res.status, ok: res.ok, json };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Backend request failed';
    return { status: 503, ok: false, json: { message } };
  }
}

export function jsonError(status: number, message: string) {
  return NextResponse.json({ message }, { status });
}
