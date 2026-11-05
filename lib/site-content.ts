import { promises as fs } from 'fs';
import path from 'path';

export const DEFAULT_ADMIN_EMAILS = ['troy@troysmithson.com'];

export function getAdminEmails() {
  const configured = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  return [...DEFAULT_ADMIN_EMAILS, ...configured];
}

export function isAdminEmail(email: string | null | undefined) {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return getAdminEmails().includes(normalized);
}

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

export async function readSettings() {
  const filePath = path.join(process.cwd(), 'data', 'settings.json');
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw) as { signupEnabled: boolean };
  } catch {
    const fallback = { signupEnabled: true };
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(fallback, null, 2));
    return fallback;
  }
}

export async function writeSettings(settings: { signupEnabled: boolean }) {
  const filePath = path.join(process.cwd(), 'data', 'settings.json');
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(settings, null, 2));
  return settings;
}
