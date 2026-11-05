import { HeaderActions } from '@/components/HeaderActions';
import { readSiteContent } from '@/lib/site-content';

export default async function HomePage() {
  const content = await readSiteContent();

  return (
    <main className="page-shell">
      <div className="container hero">
        <div className="hero-card">
          <h1>Welcome to Carnival</h1>
          <p>
            A flexible admin portal with Clerk authentication, uploaded files served under /files, and a rich-text page editor for home content.
          </p>
          <div className="cta-row">
            <HeaderActions />
          </div>
        </div>
      </div>

      <div className="container composer">
        <div className="content-html" dangerouslySetInnerHTML={{ __html: content.html }} />
      </div>
    </main>
  );
}
