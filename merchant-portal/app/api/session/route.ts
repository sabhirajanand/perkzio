import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const cookie = req.headers.get('cookie') || '';
  const has = cookie.includes('mp_session=');
  return NextResponse.json({ authenticated: has });
}
