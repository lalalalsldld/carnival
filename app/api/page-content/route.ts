import { NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/admin';
import { readAppData, writeAppData } from '@/lib/db';
import { sanitizePageHtml } from '@/lib/site-content';

export const runtime = 'nodejs';
const defaultHtml = '<h1>Welcome to Carnival</h1><p>Your editable landing page content.</p>';

export async function GET() {
  try {
    const data = await readAppData<{ html?: unknown }>('site-content', { html: defaultHtml });
    return NextResponse.json({ html: typeof data.html === 'string' ? sanitizePageHtml(data.html) : defaultHtml });
  } catch {
    return NextResponse.json({ error: 'Persistent database unavailable.' }, { status: 503 });
  }
}

export async function POST(request: Request) {
  if (!(await getAdminContext())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  let body: { html?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }); }
  if (typeof body.html !== 'string' || body.html.length > 100_000) return NextResponse.json({ error: 'Page content must be a string under 100 KB' }, { status: 400 });
  try {
    const html = sanitizePageHtml(body.html);
    await writeAppData('site-content', { html });
    return NextResponse.json({ ok: true, html });
  } catch {
    return NextResponse.json({ error: 'Could not save content to persistent database.' }, { status: 503 });
  }
}
