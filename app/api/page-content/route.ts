import { NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/admin';
import { promises as fs } from 'fs';
import path from 'path';

export const runtime = 'nodejs';
const contentPath = path.join(process.cwd(), 'data', 'site-content.json');
const defaultHtml = '<h1>Welcome to Carnival</h1><p>Your editable landing page content.</p>';

export async function GET() {
  try {
    const data = JSON.parse(await fs.readFile(contentPath, 'utf8'));
    return NextResponse.json({ html: typeof data.html === 'string' ? data.html : defaultHtml });
  } catch {
    return NextResponse.json({ html: defaultHtml });
  }
}

export async function POST(request: Request) {
  if (!(await getAdminContext())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  let body: { html?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  if (typeof body.html !== 'string' || body.html.length > 100_000) {
    return NextResponse.json({ error: 'Page content must be a string under 100 KB' }, { status: 400 });
  }

  try {
    await fs.mkdir(path.dirname(contentPath), { recursive: true });
    await fs.writeFile(contentPath, JSON.stringify({ html: body.html }, null, 2), 'utf8');
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Unable to save content; configure persistent storage for this deployment.' }, { status: 503 });
  }
}
