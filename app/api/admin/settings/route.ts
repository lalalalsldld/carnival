import { NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/admin';
import { promises as fs } from 'fs';
import path from 'path';

export const runtime = 'nodejs';
const settingsPath = path.join(process.cwd(), 'data', 'settings.json');

async function getSignupSetting() {
  try {
    const value = JSON.parse(await fs.readFile(settingsPath, 'utf8')) as { signupEnabled?: boolean };
    return typeof value.signupEnabled === 'boolean' ? value.signupEnabled : true;
  } catch {
    return true;
  }
}

export async function GET() {
  const admin = await getAdminContext();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  return NextResponse.json({ signupEnabled: await getSignupSetting() });
}

export async function POST(request: Request) {
  const admin = await getAdminContext();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  let body: { signupEnabled?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  if (typeof body.signupEnabled !== 'boolean') {
    return NextResponse.json({ error: 'signupEnabled must be a boolean' }, { status: 400 });
  }

  try {
    await fs.mkdir(path.dirname(settingsPath), { recursive: true });
    await fs.writeFile(settingsPath, JSON.stringify({ signupEnabled: body.signupEnabled }, null, 2), 'utf8');
    return NextResponse.json({ signupEnabled: body.signupEnabled });
  } catch {
    return NextResponse.json({ error: 'Unable to save settings; configure persistent storage for this deployment.' }, { status: 503 });
  }
}
