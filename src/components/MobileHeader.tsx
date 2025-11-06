'use client';

import { useState } from 'react';
import Link from 'next/link';
import { logout } from '@/app/actions/auth';

interface MobileHeaderProps {
  isAuthenticated: boolean;
  userName?: string;
}

export function MobileHeader({ isAuthenticated, userName }: MobileHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      <header style={{
        position: 'sticky',
        top: 0,
        left: 0,
        right: 0,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        color: '#1e293b',
        padding: '1rem',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        zIndex: 100,
        borderBottom: '1px solid #e5e7eb',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Link href="/" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            textDecoration: 'none',
          }}>
            <img
              src="/icon-128x128.png"
              alt="Z-Dict"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '7px',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.12)'
              }}
            />
            <span style={{
              fontSize: '1.375rem',
              fontWeight: '800',
              color: '#2c4e6b',
              letterSpacing: '-0.02em',
            }}>
              Z-Dict
            </span>
          </Link>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: '#f1f5f9',
              border: '1px solid #e5e7eb',
              borderRadius: '0.75rem',
              padding: '0.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '44px',
              minHeight: '44px',
              color: '#475569',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#e2e8f0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f1f5f9';
            }}
            aria-label="Menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {menuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M3 12h18M3 6h18M3 18h18" />
              )}
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div style={{
          position: 'fixed',
          top: '73px',
          left: 0,
          right: 0,
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
          zIndex: 99,
          animation: 'slideDown 0.2s ease-out',
          borderBottom: '1px solid #e5e7eb',
        }}>
          <nav style={{ padding: '0.5rem' }}>
            {isAuthenticated ? (
              <>
                <div style={{
                  padding: '1rem 1.25rem',
                  borderBottom: '1px solid #f1f5f9',
                  color: '#475569',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  background: 'linear-gradient(to bottom, #f8fafc 0%, #ffffff 100%)',
                }}>
                  👤 {userName || 'User'}
                </div>
                <Link
                  href="/bookmarks"
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: 'block',
                    padding: '1rem 1.25rem',
                    color: '#334155',
                    borderBottom: '1px solid #f1f5f9',
                    fontWeight: '500',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f8fafc';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  ⭐ Bookmarks
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMenuOpen(false);
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '1rem 1.25rem',
                    background: 'none',
                    color: '#ef4444',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '500',
                    transition: 'background 0.15s',
                    border: 'none',
                    outline: 'none',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.outline = 'none';
                    e.currentTarget.style.border = 'none';
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#fef2f2';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  🚪 Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: 'block',
                    padding: '1rem 1.25rem',
                    color: '#334155',
                    borderBottom: '1px solid #f1f5f9',
                    fontWeight: '500',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f8fafc';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  🔑 Login
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: 'block',
                    padding: '1rem 1.25rem',
                    color: '#334155',
                    borderBottom: '1px solid #f1f5f9',
                    fontWeight: '500',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f8fafc';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  ✨ Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      )}

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}

