import type { Metadata } from 'next';
import './globals.css';
import { ClerkProvider, UserButton } from '@clerk/nextjs';

export const metadata: Metadata = {
  title: 'Carnival',
  description: 'Carnival admin and content management app',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <header className="site-header">
            <div className="container nav">
              <a href="/" className="brand">Carnival</a>
              <nav>
                <a href="/">Home</a>
                <a href="/admin">Admin</a>
              </nav>
              <div className="header-actions">
                <UserButton afterSignOutUrl="/" />
              </div>
            </div>
          </header>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
