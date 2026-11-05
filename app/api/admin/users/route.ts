import { NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/admin';

export const runtime = 'nodejs';

export async function GET() {
  const admin = await getAdminContext();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const result = await admin.client.users.getUserList({ limit: 200 });
    return NextResponse.json({
      users: result.data.map((user) => {
        const metadata = user.publicMetadata as Record<string, unknown>;
        const status = user.banned ? 'banned' : metadata.accountStatus === 'deactivated' ? 'deactivated' : 'active';
        return {
          id: user.id,
          name: user.fullName || user.username || 'Unknown user',
          email: user.primaryEmailAddress?.emailAddress || user.emailAddresses[0]?.emailAddress || 'No email',
          status,
          createdAt: new Date(user.createdAt).toISOString(),
        };
      }),
    });
  } catch {
    return NextResponse.json({ error: 'Unable to load users from Clerk.' }, { status: 502 });
  }
}

export async function POST(request: Request) {
  const admin = await getAdminContext();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  let body: { userId?: unknown; action?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  if (typeof body.userId !== 'string' || typeof body.action !== 'string') {
    return NextResponse.json({ error: 'A userId and action are required.' }, { status: 400 });
  }
  if (body.userId === admin.user.id) {
    return NextResponse.json({ error: 'You cannot change your own account from this panel.' }, { status: 400 });
  }
  if (!['deactivate', 'ban', 'reactivate', 'reset-password'].includes(body.action)) {
    return NextResponse.json({ error: 'Unsupported action.' }, { status: 400 });
  }

  try {
    const target = await admin.client.users.getUser(body.userId);
    const targetEmail = target.primaryEmailAddress?.emailAddress;
    if (targetEmail && (target.emailAddresses.some((entry) => entry.verification?.status === 'verified' && entry.emailAddress.toLowerCase() === targetEmail.toLowerCase()))) {
      const { isAdminEmail } = await import('@/lib/admin');
      if (isAdminEmail(targetEmail)) {
        return NextResponse.json({ error: 'The configured site administrator cannot be modified.' }, { status: 400 });
      }
    }

    if (body.action === 'ban' || body.action === 'deactivate') {
      await admin.client.users.banUser(body.userId);
      await admin.client.users.updateUserMetadata(body.userId, {
        publicMetadata: { accountStatus: body.action === 'ban' ? 'banned' : 'deactivated' },
      });
      return NextResponse.json({ ok: true, status: body.action === 'ban' ? 'banned' : 'deactivated' });
    }

    if (body.action === 'reactivate') {
      await admin.client.users.unbanUser(body.userId);
      await admin.client.users.updateUserMetadata(body.userId, { publicMetadata: { accountStatus: 'active' } });
      return NextResponse.json({ ok: true, status: 'active' });
    }

    if (!targetEmail || !target.emailAddresses.some((entry) => entry.emailAddress === targetEmail && entry.verification?.status === 'verified')) {
      return NextResponse.json({ error: 'User does not have a verified primary email address.' }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.MAIL_FROM;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!apiKey || !from || !appUrl) {
      return NextResponse.json({ error: 'Password-reset email requires RESEND_API_KEY, MAIL_FROM, and NEXT_PUBLIC_APP_URL.' }, { status: 503 });
    }
    const signInUrl = new URL('/sign-in', appUrl).toString();
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [targetEmail],
        subject: 'Reset your Carnival password',
        html: `<p>An administrator requested password-reset instructions for your Carnival account.</p><p><a href="${signInUrl}">Open Carnival sign in</a>, then choose <strong>Forgot password</strong> to receive a secure reset code from Clerk.</p><p>If you did not expect this message, you can ignore it.</p>`,
      }),
    });
    if (!emailResponse.ok) return NextResponse.json({ error: 'The email provider could not send the message.' }, { status: 502 });
    return NextResponse.json({ ok: true, status: 'reset-email-sent' });
  } catch {
    return NextResponse.json({ error: 'Clerk could not complete this account action.' }, { status: 502 });
  }
}
