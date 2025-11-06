'use client';

import { useState, useEffect } from 'react';
import { searchBookmarks, removeBookmark } from '@/app/actions/translation';
import type { Bookmark } from '@/db/schema';
import { MarkdownRenderer } from './MarkdownRenderer';

export function BookmarksList() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

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

  const toggleExpand = (bookmarkId: string) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(bookmarkId)) {
        newSet.delete(bookmarkId);
      } else {
        newSet.add(bookmarkId);
      }
      return newSet;
    });
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {bookmarks.map((bookmark) => (
            <div
              key={bookmark.id}
              style={{
                padding: '2rem',
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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: expandedIds.has(bookmark.id) ? '1.25rem' : '0' }}>
                <div
                  onClick={() => toggleExpand(bookmark.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    flexWrap: 'wrap',
                    flex: 1,
                    cursor: 'pointer',
                  }}
                >
                  <button
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '1.25rem',
                      padding: '0.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#64748b',
                      transition: 'transform 0.2s',
                      transform: expandedIds.has(bookmark.id) ? 'rotate(90deg)' : 'rotate(0deg)',
                    }}
                    title={expandedIds.has(bookmark.id) ? 'Collapse' : 'Expand'}
                  >
                    ▶
                  </button>
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    color: '#1e293b',
                    letterSpacing: '-0.01em',
                    margin: 0,
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

                <button
                  onClick={() => handleRemove(bookmark.id)}
                  className="btn btn-secondary"
                  style={{
                    minWidth: '44px',
                    minHeight: '44px',
                    borderRadius: '0.75rem',
                    padding: '0.5rem',
                    flexShrink: 0,
                  }}
                  title="Remove bookmark"
                >
                  🗑️
                </button>
              </div>

              {expandedIds.has(bookmark.id) && (
                <>
                  <div style={{ marginBottom: '1.25rem' }}>
                    <MarkdownRenderer content={bookmark.translation} />
                  </div>
                  <p style={{
                    fontSize: '0.8125rem',
                    color: '#94a3b8',
                    marginTop: '0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}>
                    <span>📅</span>
                    <span>Added {new Date(bookmark.createdAt).toLocaleDateString()}</span>
                  </p>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

