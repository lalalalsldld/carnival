import { clerkClient } from '@clerk/nextjs/server';
import { auth } from '@clerk/nextjs/server';

export const DEFAULT_ADMIN_EMAILS = ['troy@troysmithson.com'];

export function getAdminEmails() {
  const configured = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  const combined = [...DEFAULT_ADMIN_EMAILS, ...configured];
  return combined.filter((email, index) => combined.indexOf(email) === index);
}

export function isAdminEmail(email: string | null | undefined) {
  return Boolean(email && getAdminEmails().includes(email.trim().toLowerCase()));
}

/** Resolve the signed-in user from Clerk on the server; never trust client metadata. */
export async function getAdminContext() {
  const { userId } = await auth();
  if (!userId) return null;

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const verifiedEmails = user.emailAddresses
    .filter((entry) => entry.verification?.status === 'verified')
    .map((entry) => entry.emailAddress.toLowerCase());

  if (!verifiedEmails.some(isAdminEmail)) return null;
  return { client, user };
}
