import type { Metadata } from 'next';
import { SignUp } from '@clerk/nextjs';

export const metadata: Metadata = {
  title: 'Sign up',
};

export default function SignUpPage() {
  return (
    <main className="page-shell">
      <div className="container" style={{ display: 'grid', placeItems: 'center', minHeight: '70vh' }}>
        <SignUp />
      </div>
    </main>
  );
}
