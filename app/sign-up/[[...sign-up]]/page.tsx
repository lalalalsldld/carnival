import { redirect } from 'next/navigation';
import { readSettings } from '@/lib/settings';
import { SignUp } from '@clerk/nextjs';

export const dynamic = 'force-dynamic';

export default async function SignUpPage() {
  const settings = await readSettings();
  if (!settings.signupEnabled) {
    return <main className="page-shell"><div className="container"><div className="empty-state"><h1>Sign up is currently closed</h1><p>Please contact the site administrator if you need access.</p></div></div></main>;
  }
  return <main className="page-shell"><div className="container" style={{ display: 'grid', placeItems: 'center', minHeight: '70vh' }}><SignUp /></div></main>;
}
