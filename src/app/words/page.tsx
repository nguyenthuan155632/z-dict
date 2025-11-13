'use client';

import { useState, useEffect } from 'react';

interface WordEntry {
  word: string;
  phonetic: string;
  part_of_speech: string;
  definitions: Array<{
    vi_meaning: string;
    en_definition: string;
    examples: Array<{
      en: string;
      vi: string;
    }>;
  }>;
}

export default function WordsPage() {
  return (
    <div style={{
      minHeight: '100vh',
      paddingBottom: '2rem',
      background: 'linear-gradient(to bottom, #f8fafc 0%, #ffffff 100%)',
    }}>
      <WordsContent />
    </div>
  );
}

function WordsContent() {
  const [words, setWords] = useState<WordEntry[]>([]);
  const [filteredWords, setFilteredWords] = useState<WordEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadWords() {
      try {
        setLoading(true);
        const response = await fetch('/words.jsonl');
        if (!response.ok) {
          throw new Error('Failed to load words');
        }

        const text = await response.text();
        const wordEntries: WordEntry[] = text
          .split('\n')
          .filter(line => line.trim())
          .map(line => JSON.parse(line));

        setWords(wordEntries);
        setFilteredWords(wordEntries);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load words');
      } finally {
        setLoading(false);
      }
    }

    loadWords();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredWords(words);
    } else {
      const filtered = words.filter(word =>
        word.word?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        word.definitions?.some(def =>
          def.vi_meaning?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          def.en_definition?.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        word.part_of_speech?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredWords(filtered);
    }
  }, [searchTerm, words]);

  if (loading) {
    return (
      <main style={{ padding: '1rem' }}>
        <div style={{
          maxWidth: '56rem',
          margin: '0 auto',
          textAlign: 'center',
          padding: '2rem 0',
        }}>
          <div style={{
            display: 'inline-block',
            width: '40px',
            height: '40px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{ marginTop: '1rem', color: '#64748b' }}>Loading words...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main style={{ padding: '1rem' }}>
        <div style={{
          maxWidth: '56rem',
          margin: '0 auto',
          textAlign: 'center',
          padding: '2rem 0',
        }}>
          <p style={{ color: '#ef4444' }}>Error: {error}</p>
        </div>
      </main>
    );
  }

  return (
    <main style={{ padding: '1rem' }}>
      <div style={{
        maxWidth: '56rem',
        margin: '0 auto',
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '2rem',
          padding: '1.5rem 0 1rem',
        }}>
          <h1 style={{
            fontSize: 'clamp(1.75rem, 6vw, 2.25rem)',
            fontWeight: '700',
            color: '#2c4e6b',
            margin: '0 0 0.5rem 0',
          }}>
            Complete Dictionary
          </h1>
          <p style={{
            fontSize: 'clamp(0.875rem, 3.5vw, 1rem)',
            color: '#64748b',
            margin: 0,
          }}>
            {words.length} words available • Search in English or Vietnamese
          </p>
        </div>

        {/* Search Input */}
        <div style={{
          marginBottom: '2rem',
          position: 'relative',
        }}>
          <div style={{
            position: 'relative',
            maxWidth: '500px',
            margin: '0 auto',
          }}>
            <input
              type="text"
              placeholder="Search words, meanings, or parts of speech..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.875rem 1rem 0.875rem 3rem',
                fontSize: '1rem',
                border: '2px solid #e5e7eb',
                borderRadius: '0.75rem',
                backgroundColor: '#ffffff',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                outline: 'none',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.boxShadow = '0 2px 12px rgba(59, 130, 246, 0.15)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.06)';
              }}
            />
            <div style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9ca3af',
              fontSize: '1.125rem',
            }}>
              🔍
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div style={{
          textAlign: 'center',
          marginBottom: '1.5rem',
        }}>
          <p style={{
            color: '#64748b',
            fontSize: '0.875rem',
            margin: 0,
          }}>
            {filteredWords.length} {filteredWords.length === 1 ? 'word' : 'words'}
            {searchTerm && ` matching "${searchTerm}"`}
          </p>
        </div>

        {/* Words Grid */}
        <div style={{
          display: 'grid',
          gap: '1rem',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        }}>
          {filteredWords.map((wordEntry, index) => (
            <div
              key={`${wordEntry.word}-${index}`}
              style={{
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '0.75rem',
                padding: '1.25rem',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                transition: 'box-shadow 0.2s, transform 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.06)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {/* Word and Phonetic */}
              <div style={{
                marginBottom: '0.75rem',
              }}>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  color: '#1f2937',
                  margin: '0 0 0.25rem 0',
                }}>
                  {wordEntry.word || 'Unknown Word'}
                </h3>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  margin: 0,
                  fontFamily: 'monospace',
                }}>
                  {wordEntry.phonetic || ''}
                </p>
                <span style={{
                  display: 'inline-block',
                  background: '#eff6ff',
                  color: '#1e40af',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '0.375rem',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  marginTop: '0.5rem',
                }}>
                  {wordEntry.part_of_speech || 'Unknown'}
                </span>
              </div>

              {/* Definitions */}
              <div style={{
                marginBottom: '0.75rem',
              }}>
                {wordEntry.definitions?.map((def, defIndex) => (
                  <div key={defIndex} style={{ marginBottom: '0.5rem' }}>
                    <p style={{
                      fontSize: '0.875rem',
                      color: '#374151',
                      margin: '0 0 0.25rem 0',
                      lineHeight: '1.5',
                    }}>
                      <strong>EN:</strong> {def.en_definition || 'No definition available'}
                    </p>
                    <p style={{
                      fontSize: '0.875rem',
                      color: '#059669',
                      margin: '0 0 0.25rem 0',
                      lineHeight: '1.5',
                    }}>
                      <strong>VI:</strong> {def.vi_meaning || 'Không có định nghĩa'}
                    </p>
                  </div>
                ))}
              </div>

              {/* Examples */}
              {wordEntry.definitions?.[0]?.examples && (
                <div style={{
                  background: '#f9fafb',
                  borderRadius: '0.5rem',
                  padding: '0.75rem',
                  border: '1px solid #e5e7eb',
                }}>
                  <p style={{
                    fontSize: '0.75rem',
                    color: '#6b7280',
                    fontWeight: '600',
                    margin: '0 0 0.5rem 0',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    Examples
                  </p>
                  {wordEntry.definitions[0].examples?.map((example, exIndex) => (
                    <div key={exIndex} style={{ marginBottom: '0.5rem' }}>
                      <p style={{
                        fontSize: '0.8125rem',
                        color: '#374151',
                        margin: '0 0 0.25rem 0',
                        lineHeight: '1.5',
                        fontStyle: 'italic',
                      }}>
                        "{example.en || 'No example available'}"
                      </p>
                      <p style={{
                        fontSize: '0.8125rem',
                        color: '#059669',
                        margin: 0,
                        lineHeight: '1.5',
                      }}>
                        "{example.vi || 'Không có ví dụ'}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredWords.length === 0 && searchTerm && (
          <div style={{
            textAlign: 'center',
            padding: '3rem 1rem',
            color: '#6b7280',
          }}>
            <p style={{
              fontSize: '1.125rem',
              marginBottom: '0.5rem',
            }}>
              No words found
            </p>
            <p style={{
              fontSize: '0.875rem',
              margin: 0,
            }}>
              Try searching with different keywords
            </p>
          </div>
        )}

        {/* Loading animation */}
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </main>
  );
}
