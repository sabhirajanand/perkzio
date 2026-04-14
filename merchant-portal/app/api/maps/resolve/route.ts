import { NextResponse } from 'next/server';

function isHttpUrl(value: string) {
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { url?: unknown } | null;
  const url = body && typeof body === 'object' && 'url' in body ? String(body.url ?? '') : '';
  if (!url || !isHttpUrl(url)) {
    return NextResponse.json({ message: 'Invalid url' }, { status: 422 });
  }

  try {
    const res = await fetch(url, { redirect: 'follow', cache: 'no-store' });
    return NextResponse.json({ resolvedUrl: res.url }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ message: e instanceof Error ? e.message : 'Resolve failed' }, { status: 500 });
  }
}

