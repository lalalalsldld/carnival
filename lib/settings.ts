import { readAppData } from '@/lib/db';

export async function readSettings() {
  try {
    const value = await readAppData<{ signupEnabled?: boolean }>('settings', { signupEnabled: true });
    return { signupEnabled: typeof value.signupEnabled === 'boolean' ? value.signupEnabled : true };
  } catch (error) {
    console.error('Unable to read persistent app settings:', error);
    return { signupEnabled: true };
  }
}
