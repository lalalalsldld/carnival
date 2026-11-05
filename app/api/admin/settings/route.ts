import { NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/admin';
import { readAppData, writeAppData } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
  const admin = await getAdminContext();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  try {
    const value = await readAppData<{ signupEnabled?: boolean }>('settings', { signupEnabled: true });
    return NextResponse.json({ signupEnabled: typeof value.signupEnabled === 'boolean' ? value.signupEnabled : true });
  } catch {
    return NextResponse.json({ error: 'Persistent database unavailable.' }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const admin = await getAdminContext();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  let body: { signupEnabled?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }); }
  if (typeof body.signupEnabled !== 'boolean') return NextResponse.json({ error: 'signupEnabled must be a boolean' }, { status: 400 });
  try {
    await writeAppData('settings', { signupEnabled: body.signupEnabled });
    return NextResponse.json({ signupEnabled: body.signupEnabled });
  } catch {
    return NextResponse.json({ error: 'Could not save setting to persistent database.' }, { status: 503 });
  }
}
