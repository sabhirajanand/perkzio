import { NextResponse } from 'next/server';

export function getApiBaseUrl(): string {
  const base = process.env.API_BASE_URL;
  if (!base) {
    throw new Error('API_BASE_URL is not set');
  }
  return base.replace(/\/+$/, '');
}

function safeJsonParse(text: string): unknown {
  const trimmed = text.trim();
  if (!trimmed) return null;
  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    return { message: 'Upstream returned non-JSON', preview: trimmed.slice(0, 240) };
  }
}

export async function proxyToBackend(input: {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
}) {
  let base: string;
  try {
    base = getApiBaseUrl();
  } catch (e) {
    const message = e instanceof Error ? e.message : 'API_BASE_URL is not set';
    return { status: 503, ok: false, json: { message } };
  }

  const url = `${base}${input.path.startsWith('/') ? '' : '/'}${input.path}`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: input.method,
      headers: {
        ...(input.body ? { 'Content-Type': 'application/json' } : {}),
        ...(input.headers || {}),
      },
      body: input.body ? JSON.stringify(input.body) : undefined,
      cache: 'no-store',
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Upstream request failed';
    return { status: 502, ok: false, json: { message: `Cannot reach API at ${base}: ${message}` } };
  }

  const text = await res.text();
  const json = safeJsonParse(text);
  return { status: res.status, ok: res.ok, json };
}

export function jsonError(status: number, message: string) {
  return NextResponse.json({ message }, { status });
}

