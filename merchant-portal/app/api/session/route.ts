import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const cookie = req.headers.get('cookie') || '';
  const authenticated = cookie.includes('mp_session=');
  const roleMatch = cookie.match(/(?:^|;\s*)mp_role=([^;]+)/);
  const role = roleMatch ? decodeURIComponent(roleMatch[1]) : null;
  return NextResponse.json({ authenticated, role });
}
