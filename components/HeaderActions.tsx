'use client';

import Link from 'next/link';
import { SignedIn, SignedOut, SignInButton, SignUpButton } from '@clerk/nextjs';

export function HeaderActions() {
  return (
    <>
      <SignedOut>
        <SignInButton mode="modal">
          <button className="primary-btn">Sign in</button>
        </SignInButton>
        <SignUpButton mode="modal">
          <button className="secondary-btn">Create account</button>
        </SignUpButton>
      </SignedOut>
      <SignedIn>
        <Link href="/admin" className="primary-btn">Open admin</Link>
      </SignedIn>
    </>
  );
}
