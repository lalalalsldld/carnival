import { neon } from '@neondatabase/serverless';

let client: ReturnType<typeof neon> | undefined;

export function db() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not configured. Add a Neon Postgres connection string in EdgeOne Makers.');
  if (!client) client = neon(url);
  return client;
}

export async function ensureAppDataTable() {
  await db()`CREATE TABLE IF NOT EXISTS carnival_app_data (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
}

export async function readAppData<T>(key: string, fallback: T): Promise<T> {
  await ensureAppDataTable();
  const rows = await db()`SELECT value FROM carnival_app_data WHERE key = ${key} LIMIT 1`;
  return (rows[0]?.value as T | undefined) ?? fallback;
}

export async function writeAppData<T>(key: string, value: T): Promise<void> {
  await ensureAppDataTable();
  await db()`INSERT INTO carnival_app_data (key, value, updated_at)
    VALUES (${key}, ${JSON.stringify(value)}::jsonb, NOW())
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`;
}
