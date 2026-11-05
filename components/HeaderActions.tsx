import { promises as fs } from 'fs';
import path from 'path';

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
