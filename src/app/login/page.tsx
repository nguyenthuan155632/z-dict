'use client';

import { login } from '@/app/actions/auth';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const result = await login(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center" style={{
      minHeight: '100vh',
      padding: '1rem',
      background: 'linear-gradient(135deg, #2c5f8d 0%, #1e3a5f 100%)',
    }}>
      <div className="card" style={{
        maxWidth: '28rem',
        width: '100%',
        borderRadius: '1.5rem',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
        border: 'none',
        background: 'transparent',
        backgroundColor: 'transparent',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: 'clamp(1.75rem, 5vw, 2rem)',
            fontWeight: '800',
            marginBottom: '0.5rem',
            color: '#ffffff',
            letterSpacing: '-0.02em',
          }}>
            Welcome Back
          </h1>
          <p style={{
            color: '#e0e7ff',
            fontSize: '0.9375rem',
            fontWeight: '500',
          }}>
            Login to continue your learning journey
          </p>
        </div>

        {error && (
          <div style={{
            padding: '1rem',
            backgroundColor: '#fef2f2',
            color: '#dc2626',
            borderRadius: '0.75rem',
            marginBottom: '1.5rem',
            fontSize: '0.9375rem',
            fontWeight: '500',
            border: '1px solid #fecaca',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <span style={{ fontSize: '1.25rem' }}>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label htmlFor="email" style={{
              display: 'block',
              marginBottom: '0.75rem',
              fontWeight: '600',
              fontSize: '0.9375rem',
              color: '#ffffff'
            }}>
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="input"
              placeholder="your@email.com"
              style={{
                fontSize: '16px',
                padding: '0.875rem 1rem',
                borderRadius: '0.75rem',
                transition: 'all 0.2s',
              }}
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password" style={{
              display: 'block',
              marginBottom: '0.75rem',
              fontWeight: '600',
              fontSize: '0.9375rem',
              color: '#ffffff',
              marginTop: '1rem',
            }}>
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="input"
              placeholder="Enter your password"
              style={{
                fontSize: '16px',
                padding: '0.875rem 1rem',
                borderRadius: '0.75rem',
                transition: 'all 0.2s',
              }}
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{
              marginTop: '0.5rem',
              padding: '0.875rem 1.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              borderRadius: '0.75rem',
              background: 'linear-gradient(135deg, #2c5f8d 0%, #1e3a5f 100%)',
              boxShadow: '0 4px 12px rgba(30, 58, 95, 0.3)',
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <span className="loading-spinner">⟳</span> Logging in...
              </span>
            ) : (
              'Login'
            )}
          </button>
        </form>

        <p style={{
          marginTop: '1.5rem',
          textAlign: 'center',
          color: '#e0e7ff',
          fontSize: '0.9375rem',
        }}>
          Don't have an account?{' '}
          <Link
            href="/signup"
            style={{
              color: '#ffffff',
              fontWeight: '600',
              textDecoration: 'underline',
            }}
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

