import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

const siteContentPath = path.join(process.cwd(), 'data', 'site-content.json');

export async function GET() {
  try {
    const raw = await fs.readFile(siteContentPath, 'utf8');
    return NextResponse.json(JSON.parse(raw));
  } catch {
    const fallback = {
      html: '<h1>Welcome to Carnival</h1><p>Your editable landing page content.</p>',
    };

    await fs.mkdir(path.dirname(siteContentPath), { recursive: true });
    await fs.writeFile(siteContentPath, JSON.stringify(fallback, null, 2));
    return NextResponse.json(fallback);
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const nextData = {
    html: String(body.html || '<p>Empty content</p>'),
  };

  await fs.mkdir(path.dirname(siteContentPath), { recursive: true });
  await fs.writeFile(siteContentPath, JSON.stringify(nextData, null, 2));

  return NextResponse.json(nextData);
}
