import { promises as fs } from 'fs';
import path from 'path';

export async function readSiteContent() {
  const filePath = path.join(process.cwd(), 'data', 'site-content.json');
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw) as { html: string };
  } catch {
    const fallback = {
      html: '<h1>Welcome to Carnival</h1><p>Your editable landing page content.</p>',
    };
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(fallback, null, 2));
    return fallback;
  }
}

export async function writeSiteContent(html: string) {
  const filePath = path.join(process.cwd(), 'data', 'site-content.json');
  const payload = { html };
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(payload, null, 2));
  return payload;
}
