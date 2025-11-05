import { MobileHeader } from '@/components/MobileHeader';
import { MobileTranslationInterface } from '@/components/MobileTranslationInterface';
import { auth } from '@/lib/auth';

export default async function HomePage() {
  const session = await auth();

  return (
    <div style={{
      minHeight: '100vh',
      paddingBottom: '2rem',
      background: 'linear-gradient(to bottom, #f8fafc 0%, #ffffff 100%)',
    }}>
      <MobileHeader
        isAuthenticated={!!session?.user}
        userName={session?.user?.name || undefined}
      />

      <main style={{ padding: '1rem' }}>
        <div style={{
          maxWidth: '56rem',
          margin: '0 auto',
          textAlign: 'center',
          marginBottom: '2rem',
          padding: '2rem 0 1.5rem',
        }}>
          <h1 style={{
            fontSize: 'clamp(2rem, 8vw, 2.75rem)',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '0.75rem',
            letterSpacing: '-0.02em',
          }}>
            Z-Dict
          </h1>
          <p style={{
            fontSize: 'clamp(1rem, 4vw, 1.125rem)',
            color: '#64748b',
            fontWeight: '500',
          }}>
            English ⇄ Vietnamese Dictionary
          </p>
        </div>

        <MobileTranslationInterface isAuthenticated={!!session?.user} />

        {!session?.user && (
          <div style={{
            maxWidth: '56rem',
            margin: '2rem auto 0',
            padding: '1.25rem 1.5rem',
            background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
            borderRadius: '1rem',
            textAlign: 'center',
            border: '1px solid #e5e7eb',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.1)',
          }}>
            <p style={{
              color: '#1e40af',
              fontSize: '0.9375rem',
              fontWeight: '500',
              lineHeight: '1.6',
              margin: 0,
            }}>
              <span style={{ fontSize: '1.25rem', marginRight: '0.5rem' }}>💡</span>
              <strong>Tip:</strong> Sign up to bookmark words and access them offline!
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

