import type { Metadata } from 'next';
import { SignIn } from '@clerk/nextjs';

export const metadata: Metadata = {
  title: 'Sign in',
};

export default function SignInPage() {
  return (
    <main className="page-shell">
      <div className="container" style={{ display: 'grid', placeItems: 'center', minHeight: '70vh' }}>
        <SignIn />
      </div>
    </main>
  );
}
