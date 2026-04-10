import { NextResponse } from 'next/server';

export function getApiBaseUrl(): string {
  const base = process.env.API_BASE_URL;
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
  const url = `${getApiBaseUrl()}${input.path.startsWith('/') ? '' : '/'}${input.path}`;
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
  const json = text ? (JSON.parse(text) as unknown) : null;
  return { status: res.status, ok: res.ok, json };
}

export function jsonError(status: number, message: string) {
  return NextResponse.json({ message }, { status });
}

