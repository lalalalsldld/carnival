import { promises as fs } from 'fs';
import path from 'path';

export async function readSettings() {
  const filePath = path.join(process.cwd(), 'data', 'settings.json');
  try {
    const raw = JSON.parse(await fs.readFile(filePath, 'utf8')) as { signupEnabled?: boolean };
    return { signupEnabled: typeof raw.signupEnabled === 'boolean' ? raw.signupEnabled : true };
  } catch {
    return { signupEnabled: true };
  }
}
