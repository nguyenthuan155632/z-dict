'use client';

export default function OfflinePage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }}>
      <div style={{
        background: 'white',
        borderRadius: '1.5rem',
        padding: '2.5rem 2rem',
        maxWidth: '420px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.25)',
        border: 'none',
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '96px',
          height: '96px',
          borderRadius: '24px',
          background: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
          marginBottom: '1.5rem',
          boxShadow: '0 8px 24px rgba(100, 116, 139, 0.3)',
        }}>
          <span style={{ fontSize: '3rem' }}>📡</span>
        </div>
        <h1 style={{
          fontSize: 'clamp(1.5rem, 5vw, 1.875rem)',
          fontWeight: '800',
          color: '#1e293b',
          marginBottom: '0.75rem',
          letterSpacing: '-0.02em',
        }}>
          You're Offline
        </h1>
        <p style={{
          color: '#64748b',
          marginBottom: '2rem',
          lineHeight: '1.7',
          fontSize: '0.9375rem',
        }}>
          It looks like you've lost your internet connection. Some features may not be available.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="btn btn-primary"
          style={{
            width: '100%',
            padding: '0.875rem 1.5rem',
            fontSize: '1rem',
            fontWeight: '600',
            borderRadius: '0.75rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
          }}
        >
          <span>🔄</span>
          <span>Try Again</span>
        </button>
      </div>
    </div>
  );
}

