'use client';

import { useState, useEffect } from 'react';
import { searchBookmarks, removeBookmark } from '@/app/actions/translation';
import type { Bookmark } from '@/db/schema';

export function BookmarksList() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    setLoading(true);
    const results = await searchBookmarks('');
    setBookmarks(results);
    setLoading(false);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    const results = await searchBookmarks(query);
    setBookmarks(results);
  };

  const handleRemove = async (bookmarkId: string) => {
    const result = await removeBookmark(bookmarkId);
    if (result.success) {
      setBookmarks(bookmarks.filter(b => b.id !== bookmarkId));
    }
  };

  if (loading) {
    return (
      <div className="card">
        <p style={{ textAlign: 'center', color: '#6b7280' }}>Loading bookmarks...</p>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: '1.5rem' }}>
      {/* Search */}
      <div style={{ marginBottom: '1.5rem' }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="🔍 Search bookmarks..."
          className="input"
          style={{
            padding: '0.875rem 1rem',
            fontSize: '16px',
            borderRadius: '0.75rem',
          }}
        />
      </div>

      {/* Bookmarks List */}
      {bookmarks.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem 2rem',
          color: '#64748b',
        }}>
          <div style={{
            fontSize: '3rem',
            marginBottom: '1rem',
            opacity: 0.5,
          }}>
            {searchQuery ? '🔍' : '⭐'}
          </div>
          <p style={{
            fontSize: '1rem',
            fontWeight: '500',
            marginBottom: '0.5rem',
            color: '#475569',
          }}>
            {searchQuery ? 'No bookmarks found' : 'No bookmarks yet'}
          </p>
          <p style={{
            fontSize: '0.875rem',
            color: '#94a3b8',
            lineHeight: '1.6',
          }}>
            {searchQuery
              ? 'Try a different search term'
              : 'Start translating and bookmark your favorite words!'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {bookmarks.map((bookmark) => (
            <div
              key={bookmark.id}
              style={{
                padding: '1.25rem',
                background: 'linear-gradient(to bottom, #ffffff 0%, #f8fafc 100%)',
                borderRadius: '0.75rem',
                border: '1px solid #e5e7eb',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.04)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                    <h3 style={{
                      fontSize: '1.25rem',
                      fontWeight: '700',
                      color: '#1e293b',
                      letterSpacing: '-0.01em',
                    }}>
                      {bookmark.word}
                    </h3>
                    <span style={{
                      padding: '0.25rem 0.625rem',
                      background: bookmark.language === 'en'
                        ? 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)'
                        : 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                      color: bookmark.language === 'en' ? '#1e40af' : '#92400e',
                      borderRadius: '0.5rem',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      border: '1px solid #e5e7eb',
                    }}>
                      {bookmark.language === 'en' ? 'EN' : 'VI'}
                    </span>
                  </div>
                  <div
                    style={{
                      color: '#475569',
                      fontSize: '0.9375rem',
                      whiteSpace: 'pre-wrap',
                      lineHeight: '1.7',
                      marginBottom: '0.75rem',
                    }}
                    dangerouslySetInnerHTML={{
                      __html: bookmark.translation.replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 600; color: #1e293b;">$1</strong>')
                    }}
                  />
                  <p style={{
                    fontSize: '0.8125rem',
                    color: '#94a3b8',
                    marginTop: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}>
                    <span>📅</span>
                    <span>Added {new Date(bookmark.createdAt).toLocaleDateString()}</span>
                  </p>
                </div>
                <button
                  onClick={() => handleRemove(bookmark.id)}
                  className="btn btn-secondary"
                  style={{
                    marginLeft: 'auto',
                    minWidth: '44px',
                    borderRadius: '0.75rem',
                    flexShrink: 0,
                  }}
                  title="Remove bookmark"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

