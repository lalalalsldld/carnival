import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const settingsPath = path.join(process.cwd(), 'data', 'settings.json');

export async function GET() {
  try {
    const raw = await fs.readFile(settingsPath, 'utf8');
    return NextResponse.json(JSON.parse(raw));
  } catch {
    const fallback = { signupEnabled: true };
    await fs.mkdir(path.dirname(settingsPath), { recursive: true });
    await fs.writeFile(settingsPath, JSON.stringify(fallback, null, 2));
    return NextResponse.json(fallback);
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const nextData = {
    signupEnabled: Boolean(body.signupEnabled),
  };

  await fs.mkdir(path.dirname(settingsPath), { recursive: true });
  await fs.writeFile(settingsPath, JSON.stringify(nextData, null, 2));

  return NextResponse.json(nextData);
}
