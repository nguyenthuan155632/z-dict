import { MobileHeader } from '@/components/MobileHeader';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { BookmarksList } from '@/components/BookmarksList';

export default async function BookmarksPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div style={{
      minHeight: '100vh',
      paddingBottom: '2rem',
      background: 'linear-gradient(to bottom, #f8fafc 0%, #ffffff 100%)',
    }}>
      <MobileHeader
        isAuthenticated={true}
        userName={session.user.name || undefined}
      />
      <main style={{ padding: '1rem' }}>
        <div style={{ maxWidth: '56rem', margin: '0 auto' }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '2rem',
            padding: '1.5rem 0 1rem',
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '64px',
              height: '64px',
              borderRadius: '18px',
              background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
              marginBottom: '1rem',
              boxShadow: '0 8px 20px rgba(251, 191, 36, 0.25)',
            }}>
              <span style={{ fontSize: '2rem' }}>⭐</span>
            </div>
            <h1 style={{
              fontSize: 'clamp(1.75rem, 6vw, 2.25rem)',
              fontWeight: '800',
              color: '#1e293b',
              marginBottom: '0.5rem',
              letterSpacing: '-0.02em',
            }}>
              My Bookmarks
            </h1>
            <p style={{
              color: '#64748b',
              fontSize: '0.9375rem',
              fontWeight: '500',
            }}>
              Your saved words and translations
            </p>
          </div>

          <BookmarksList />
        </div>
      </main>
    </div>
  );
}

