import { auth } from '@/lib/auth';
import { logout } from '@/app/actions/auth';
import Link from 'next/link';

export async function Header() {
  const session = await auth();

  return (
    <header style={{
      background: 'rgba(255, 255, 255, 0.95)',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div style={{
        maxWidth: '80rem',
        margin: '0 auto',
        padding: '1rem 1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <img
            src="/icon-128x128.png"
            alt="Z-Dict"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}
          />
          <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#2c4e6b', letterSpacing: '-0.02em' }}>
            Z-Dict
          </span>
        </Link>

        <nav style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          {session?.user ? (
            <>
              <Link href="/" style={{ color: '#374151', fontWeight: '500' }}>
                Translate
              </Link>
              <Link href="/words" style={{ color: '#374151', fontWeight: '500' }}>
                Dictionary
              </Link>
              <Link href="/flashcards/select" style={{ color: '#374151', fontWeight: '500' }}>
                Flashcards
              </Link>
              <Link href="/bookmarks" style={{ color: '#374151', fontWeight: '500' }}>
                Bookmarks
              </Link>
              <span style={{ color: '#6b7280' }}>
                {session.user.name || session.user.email}
              </span>
              <form action={logout}>
                <button type="submit" className="btn btn-secondary">
                  Logout
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-secondary">
                Login
              </Link>
              <Link href="/signup" className="btn btn-primary">
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

