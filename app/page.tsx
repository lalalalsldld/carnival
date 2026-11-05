import { promises as fs } from 'fs';
import path from 'path';
import { readSiteContent } from '@/lib/site-content';
import { HeaderActions } from '@/components/HeaderActions';

export default async function HomePage() {
  const content = await readSiteContent();
  return (
    <main className="page-shell">
      <div className="container hero">
        <div className="hero-card">
          <h1>Welcome to Carnival</h1>
          <p>A private, Clerk-powered site with an admin-managed homepage.</p>
          <div className="cta-row"><HeaderActions /></div>
        </div>
      </div>
      <div className="container composer">
        <div className="content-html" dangerouslySetInnerHTML={{ __html: content.html }} />
      </div>
    </main>
  );
}
