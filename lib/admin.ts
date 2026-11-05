import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

const adminEmails = ['troy@troysmithson.com'];

export function isAdminEmail(email: string | null | undefined) {
  if (!email) return false;
  return adminEmails.includes(email.trim().toLowerCase());
}

export function getAdminEmails() {
  return [...adminEmails, ...(process.env.ADMIN_EMAILS ?? '').split(',').map((value) => value.trim()).filter(Boolean)];
}

export async function ensureAdminUser(email: string | null | undefined) {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  const candidates = getAdminEmails();
  return candidates.includes(normalized);
}

export async function readSiteContent() {
  const filePath = path.join(process.cwd(), 'data', 'site-content.json');
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return JSON.parse(content) as { html: string };
  } catch {
    const fallback = { html: '<h1>Welcome to Carnival</h1><p>Your editable landing page content.</p>' };
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

export async function getMockUsers() {
  return [
    {
      id: 'demo-user-1',
      name: 'Troy Smithson',
      email: 'troy@troysmithson.com',
      status: 'active',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo-user-2',
      name: 'Sam Carter',
      email: 'sam@example.com',
      status: 'active',
      createdAt: new Date().toISOString(),
    },
  ];
}

export async function updateMockUserStatus(userId: string, status: string) {
  const list = await getMockUsers();
  const current = list.find((user) => user.id === userId);
  if (!current) return { ok: true, status };
  current.status = status;
  return { ok: true, status };
}
