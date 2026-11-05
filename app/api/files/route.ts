import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const uploadDir = path.join(process.cwd(), 'public', 'files');

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'Missing file' }, { status: 400 });
  }

  const fileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
  const bytes = Buffer.from(await file.arrayBuffer());

  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(path.join(uploadDir, fileName), bytes);

  return NextResponse.json({
    ok: true,
    file: { name: fileName, url: `/files/${encodeURIComponent(fileName)}` },
  });
}

export async function GET() {
  try {
    const files = await fs.readdir(uploadDir);
    const entries = await Promise.all(
      files
        .filter((name) => !name.startsWith('.'))
        .map(async (name) => ({
          name,
          url: `/files/${encodeURIComponent(name)}`,
          size: (await fs.stat(path.join(uploadDir, name))).size,
        }))
    );

    return NextResponse.json({ files: entries });
  } catch {
    return NextResponse.json({ files: [] });
  }
}
