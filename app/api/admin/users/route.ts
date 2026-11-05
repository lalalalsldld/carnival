import { NextResponse } from 'next/server';
import { getAdminContext, isAdminEmail } from '@/lib/admin';

export const runtime = 'nodejs';

export async function GET() {
  const admin = await getAdminContext();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const result = await admin.client.users.getUserList({ limit: 200 });
    return NextResponse.json({ users: result.data.map((user) => {
      const metadata = user.publicMetadata as Record<string, unknown>;
      const status = user.banned ? (metadata.accountStatus === 'deactivated' ? 'deactivated' : 'banned') : 'active';
      return { id: user.id, name: user.fullName || user.username || 'Unknown user', email: user.primaryEmailAddress?.emailAddress || user.emailAddresses[0]?.emailAddress || 'No email', status, createdAt: new Date(user.createdAt).toISOString() };
    }) });
  } catch {
    return NextResponse.json({ error: 'Unable to load users from Clerk.' }, { status: 502 });
  }
}

export async function POST(request: Request) {
  const admin = await getAdminContext();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  let body: { userId?: unknown; action?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }); }
  if (typeof body.userId !== 'string' || typeof body.action !== 'string') return NextResponse.json({ error: 'A userId and action are required.' }, { status: 400 });
  if (body.userId === admin.user.id) return NextResponse.json({ error: 'You cannot change your own account from this panel.' }, { status: 400 });
  if (!['deactivate', 'ban', 'reactivate', 'reset-password'].includes(body.action)) return NextResponse.json({ error: 'Unsupported action.' }, { status: 400 });

  try {
    const target = await admin.client.users.getUser(body.userId);
    const verifiedEmails = target.emailAddresses.filter((entry) => entry.verification?.status === 'verified').map((entry) => entry.emailAddress);
    if (verifiedEmails.some(isAdminEmail)) return NextResponse.json({ error: 'The configured site administrator cannot be modified.' }, { status: 400 });

    if (body.action === 'ban' || body.action === 'deactivate') {
      await admin.client.users.banUser(body.userId);
      await admin.client.users.updateUserMetadata(body.userId, { publicMetadata: { accountStatus: body.action === 'ban' ? 'banned' : 'deactivated' } });
      return NextResponse.json({ ok: true, status: body.action === 'ban' ? 'banned' : 'deactivated' });
    }

    if (body.action === 'reactivate') {
      await admin.client.users.unbanUser(body.userId);
      await admin.client.users.updateUserMetadata(body.userId, { publicMetadata: { accountStatus: 'active' } });
      return NextResponse.json({ ok: true, status: 'active' });
    }

    return NextResponse.json({ ok: true, status: 'reset-flow', message: 'Ask the user to use Forgot password on the sign-in page.' });
  } catch {
    return NextResponse.json({ error: 'Clerk could not complete this account action.' }, { status: 502 });
  }
}
