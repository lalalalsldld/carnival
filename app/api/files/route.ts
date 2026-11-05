import { NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/admin';

/** File uploads have been intentionally disabled and removed from the admin app. */
export async function GET() {
  if (!(await getAdminContext())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  return NextResponse.json({ files: [] });
}

export async function POST() {
  if (!(await getAdminContext())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  return NextResponse.json({ error: 'File uploads are disabled.' }, { status: 410 });
}

export async function DELETE() {
  if (!(await getAdminContext())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  return NextResponse.json({ error: 'File uploads are disabled.' }, { status: 410 });
}
