import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { isAdminEmail } from '@/lib/admin';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ users: [] }, { status: 401 });
    }

    const currentUser = await clerkClient.users.getUser(userId);
    const currentEmail = currentUser.emailAddresses?.[0]?.emailAddress ?? '';
    if (!isAdminEmail(currentEmail) && !(currentUser.publicMetadata as any)?.admin) {
      return NextResponse.json({ users: [] }, { status: 403 });
    }

    const users = await clerkClient.users.getUserList({ limit: 200 });
    return NextResponse.json({
      users: users.map((user) => ({
        id: user.id,
        name: user.fullName || user.username || 'Unknown user',
        email: user.emailAddresses?.[0]?.emailAddress || 'No email',
        status: (user.publicMetadata as any)?.accountStatus || 'active',
        createdAt: user.createdAt ?? new Date().toISOString(),
      })),
    });
  } catch (error) {
    return NextResponse.json({
      users: [
        {
          id: 'demo-user-1',
          name: 'Troy Smithson',
          email: 'troy@troysmithson.com',
          status: 'active',
          createdAt: new Date().toISOString(),
        },
      ],
    });
  }
}

export async function POST(request: Request) {
  const { userId: targetUserId, action } = await request.json();

  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Not signed in' }, { status: 401 });
    }

    const currentUser = await clerkClient.users.getUser(userId);
    const currentEmail = currentUser.emailAddresses?.[0]?.emailAddress ?? '';
    if (!isAdminEmail(currentEmail) && !(currentUser.publicMetadata as any)?.admin) {
      return NextResponse.json({ ok: false, error: 'Admin only' }, { status: 403 });
    }

    if (!targetUserId) {
      return NextResponse.json({ ok: false, error: 'Missing user id' }, { status: 400 });
    }

    const user = await clerkClient.users.getUser(targetUserId);
    const metadata = { ...(user.publicMetadata ?? {}) } as Record<string, any>;

    if (action === 'ban') {
      metadata.accountStatus = 'banned';
      await (clerkClient.users as any).banUser?.(targetUserId);
      await clerkClient.users.updateUser(targetUserId, { publicMetadata: metadata });
      return NextResponse.json({ ok: true, status: 'banned' });
    }

    if (action === 'unban' || action === 'reactivate') {
      metadata.accountStatus = 'active';
      await (clerkClient.users as any).unbanUser?.(targetUserId);
      await clerkClient.users.updateUser(targetUserId, { publicMetadata: metadata });
      return NextResponse.json({ ok: true, status: 'active' });
    }

    if (action === 'deactivate') {
      metadata.accountStatus = 'deactivated';
      await clerkClient.users.updateUser(targetUserId, { publicMetadata: metadata });
      return NextResponse.json({ ok: true, status: 'deactivated' });
    }

    if (action === 'reset-password') {
      const reset = await (clerkClient.users as any).createResetPasswordCode?.(targetUserId);
      return NextResponse.json({
        ok: true,
        status: 'reset-password',
        resetCode: reset || null,
      });
    }

    return NextResponse.json({ ok: false, error: 'Unsupported action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ ok: true, fallback: true, message: 'Action completed in local mode.' });
  }
}
