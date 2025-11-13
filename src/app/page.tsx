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
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            marginBottom: '0.75rem',
          }}>
            <img
              src="/icon-192x192.png"
              alt="Z-Dict"
              style={{
                width: 'clamp(48px, 12vw, 72px)',
                height: 'clamp(48px, 12vw, 72px)',
                borderRadius: 'clamp(10px, 2.5vw, 16px)',
                boxShadow: '0 4px 16px rgba(30, 58, 95, 0.2)'
              }}
            />
            <h1 style={{
              fontSize: 'clamp(2rem, 8vw, 2.75rem)',
              fontWeight: '800',
              color: '#2c4e6b',
              margin: 0,
              letterSpacing: '-0.02em',
            }}>
              Z-Dict
            </h1>
          </div>
          <p style={{
            fontSize: 'clamp(1rem, 4vw, 1.125rem)',
            color: '#64748b',
            fontWeight: '500',
          }}>
            English ⇄ Vietnamese Dictionary
          </p>
        </div>

        <MobileTranslationInterface isAuthenticated={!!session?.user} />

        {/* Complete Dictionary Entry Point */}
        <div style={{
          maxWidth: '56rem',
          margin: '2rem auto 0',
        }}>
          <a
            href="/words"
            style={{
              display: 'block',
              textDecoration: 'none',
              background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
              borderRadius: '1rem',
              padding: '1.5rem',
              textAlign: 'center',
              border: '1px solid #0ea5e9',
              boxShadow: '0 4px 16px rgba(14, 165, 233, 0.15)',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              marginBottom: '0.75rem',
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                borderRadius: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
              }}>
                📚
              </div>
              <div style={{
                textAlign: 'left',
              }}>
                <h3 style={{
                  fontSize: '1.125rem',
                  fontWeight: '700',
                  color: '#0c4a6e',
                  margin: '0 0 0.25rem 0',
                }}>
                  Complete Dictionary
                </h3>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#0369a1',
                  margin: 0,
                  fontWeight: '500',
                }}>
                  Browse 1,000+ words with search
                </p>
              </div>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              color: '#0284c7',
              fontSize: '0.875rem',
              fontWeight: '600',
            }}>
              <span>View all words</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </div>
          </a>
        </div>

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

