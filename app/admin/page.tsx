import { redirect } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';
import { isAdminEmail } from '@/lib/admin';
import { AdminDashboard } from '@/components/AdminDashboard';

export default async function AdminPage() {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  const email = user.emailAddresses?.[0]?.emailAddress ?? '';
  if (!isAdminEmail(email) && !(user.publicMetadata as any)?.admin) {
    redirect('/');
  }

  return (
    <main className="admin-shell">
      <div className="container">
        <AdminDashboard />
      </div>
    </main>
  );
}
