'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

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

interface DailyWordSet {
  id: string;
  date: string;
  wordData: string;
  createdAt: string;
}

export default function FlashcardSelectPage() {
  const { data: session, status } = useSession();
  const [allWords, setAllWords] = useState<WordEntry[]>([]);
  const [selectedWords, setSelectedWords] = useState<WordEntry[]>([]);
  const [candidateWords, setCandidateWords] = useState<WordEntry[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasTodaySet, setHasTodaySet] = useState(false);
  const [todaySet, setTodaySet] = useState<DailyWordSet | null>(null);
  const [historyWords, setHistoryWords] = useState<WordEntry[]>([]);

  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  const currentCandidateWord = candidateWords[currentWordIndex];
  const currentCandidateDefinition = currentCandidateWord?.definitions?.[0];

  function normalizeWordEntry(entry: Partial<WordEntry> & Record<string, any>): WordEntry {
    const definitionsArray = Array.isArray(entry.definitions) && entry.definitions.length > 0
      ? entry.definitions
      : [{
        vi_meaning: entry.vi_meaning ?? entry.definition ?? '',
        en_definition: entry.en_definition ?? entry.definition ?? '',
        examples: Array.isArray(entry.examples) ? entry.examples : [],
      }];

    return {
      word: entry.word ?? 'unknown',
      phonetic: entry.phonetic ?? '',
      part_of_speech: entry.part_of_speech ?? entry.partOfSpeech ?? '',
      definitions: definitionsArray,
    };
  }

  function parseSavedWords(rawValue: string): WordEntry[] {
    if (!rawValue) {
      return [];
    }

    try {
      let parsed: unknown = JSON.parse(rawValue);
      if (typeof parsed === 'string') {
        parsed = JSON.parse(parsed);
      }
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed.map(normalizeWordEntry);
    } catch {
      return [];
    }
  }

  // All hooks must be called before any conditional returns
  useEffect(() => {
    if (status !== 'authenticated' || !session?.user) {
      return;
    }

    loadData();
  }, [status, session]);

  useEffect(() => {
    if (!hasTodaySet) return;
    let isMounted = true;

    async function fetchHistoryWords() {
      try {
        const response = await fetch(`/api/flashcards/daily-set?excludeDate=${today}`);
        if (!response.ok) return;

        const data = await response.json();
        const rawHistory = Array.isArray(data.historyWords) ? data.historyWords : [];
        if (isMounted) {
          setHistoryWords(rawHistory.map(normalizeWordEntry));
        }
      } catch (err) {
        console.error('Failed to load history words:', err);
      }
    }

    fetchHistoryWords();

    return () => {
      isMounted = false;
    };
  }, [hasTodaySet, today]);

  async function loadData() {
    try {
      if (!session?.user?.id) {
        return;
      }

      setLoading(true);

      // Load all words from the JSONL file
      const wordsResponse = await fetch('/words.jsonl');
      if (!wordsResponse.ok) {
        throw new Error('Failed to load words');
      }
      const wordsText = await wordsResponse.text();
      const wordsData: WordEntry[] = wordsText
        .split('\n')
        .filter(line => line.trim())
        .map(line => JSON.parse(line));

      setAllWords(wordsData);

      // Check if user already has today's word set
      const checkResponse = await fetch(`/api/flashcards/daily-set?date=${today}`, {
        credentials: 'include', // Important: include session cookies
      });

      if (checkResponse.ok) {
        const existingSet = await checkResponse.json();
        if (existingSet.set) {
          setHasTodaySet(true);
          setTodaySet(existingSet.set);
        }
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  async function generateCandidateWords() {
    try {
      setLoading(true);

      // Get already selected words to avoid duplicates
      const historyResponse = await fetch('/api/flashcards/selected-words', {
        credentials: 'include',
      });
      const historyData = await historyResponse.json();
      const previouslySelectedWords = historyData.words || [];
      const previouslySelectedSet = new Set(previouslySelectedWords);

      // Filter out previously selected words
      const availableWords = allWords.filter(word =>
        !previouslySelectedSet.has(word.word)
      );

      // Randomly select 50 words as candidates (more than needed for variety)
      const shuffled = [...availableWords].sort(() => 0.5 - Math.random());
      const candidates = shuffled.slice(0, 50);

      setCandidateWords(candidates);
      setCurrentWordIndex(0);
      setSelectedWords([]);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate words');
    } finally {
      setLoading(false);
    }
  }

  function toggleWordSelection(word: WordEntry) {
    const isSelected = selectedWords.some(selected => selected.word === word.word);

    if (isSelected) {
      setSelectedWords(prev => prev.filter(selected => selected.word !== word.word));
    } else if (selectedWords.length < 20) {
      const newSelectedWords = [...selectedWords, word];
      setSelectedWords(newSelectedWords);

      // Auto-advance to next word if we haven't reached the limit
      if (newSelectedWords.length < 20 && currentWordIndex < candidateWords.length - 1) {
        setCurrentWordIndex(prev => prev + 1);
      }
    }
  }

  function navigateToWord(index: number) {
    if (index >= 0 && index < candidateWords.length) {
      setCurrentWordIndex(index);
    }
  }

  async function saveSelectedWords() {
    if (selectedWords.length === 0) return;

    try {
      // Save the selected word set
      const saveResponse = await fetch('/api/flashcards/daily-set', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: today,
          wordData: selectedWords,
        }),
        credentials: 'include',
      });

      if (!saveResponse.ok) {
        throw new Error('Failed to save word set');
      }

      // Save selected words to history
      await fetch('/api/flashcards/selected-words/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          words: selectedWords.map(w => w.word),
          selectedDate: today,
        }),
        credentials: 'include',
      });

      // Redirect to learning page
      window.location.href = '/flashcards/learn';

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save word set');
    }
  }

  // Now handle all the conditional renders after all hooks are declared
  if (status === 'loading') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(to bottom, #f8fafc 0%, #ffffff 100%)',
      }}>
        <div style={{
          textAlign: 'center',
          padding: '2rem',
        }}>
          <div style={{
            display: 'inline-block',
            width: '40px',
            height: '40px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '1rem',
          }} />
          <p style={{ color: '#64748b' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(to bottom, #f8fafc 0%, #ffffff 100%)',
      }}>
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          background: 'white',
          borderRadius: '0.75rem',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
          maxWidth: '32rem',
        }}>
          <div style={{
            fontSize: '3rem',
            marginBottom: '1rem',
          }}>
            🔐
          </div>
          <h2 style={{ color: '#374151', marginBottom: '1rem' }}>
            Please log in to use flashcards
          </h2>
          <p style={{ color: '#64748b', marginBottom: '2rem', lineHeight: '1.6' }}>
            You need to be logged in to select and learn daily vocabulary words.
            Please sign in to continue.
          </p>

          <button
            onClick={() => window.location.href = '/login'}
            style={{
              background: '#3b82f6',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              marginRight: '1rem',
            }}
          >
            Go to Login
          </button>

          <button
            onClick={() => window.location.reload()}
            style={{
              background: '#6b7280',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(to bottom, #f8fafc 0%, #ffffff 100%)',
      }}>
        <div style={{
          textAlign: 'center',
          padding: '2rem',
        }}>
          <div style={{
            display: 'inline-block',
            width: '40px',
            height: '40px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '1rem',
          }} />
          <p style={{ color: '#64748b' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(to bottom, #f8fafc 0%, #ffffff 100%)',
      }}>
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          background: 'white',
          borderRadius: '0.75rem',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
        }}>
          <p style={{ color: '#ef4444', marginBottom: '1rem' }}>Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: '#3b82f6',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show today's existing set
  if (hasTodaySet && todaySet) {
    const wordsData = parseSavedWords(todaySet.wordData);
    return (
      <div style={{
        minHeight: '100vh',
        paddingBottom: '2rem',
        background: 'linear-gradient(to bottom, #f8fafc 0%, #ffffff 100%)',
      }}>
        <div style={{
          maxWidth: '56rem',
          margin: '0 auto',
          padding: '2rem 1rem',
          textAlign: 'center',
        }}>
          <h1 style={{
            fontSize: 'clamp(1.75rem, 6vw, 2.25rem)',
            fontWeight: '700',
            color: '#2c4e6b',
            margin: '0 0 1rem 0',
          }}>
            Today's Words Already Selected
          </h1>
          <p style={{ color: '#64748b', marginBottom: '2rem' }}>
            You have already selected {wordsData.length} words for today ({today})
          </p>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '0.75rem',
            marginBottom: '2rem',
          }}>
            <button
              onClick={() => window.location.href = '/flashcards/learn'}
              style={{
                background: '#10b981',
                color: 'white',
                padding: '0.8rem 1.5rem',
                borderRadius: '0.75rem',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.95rem',
                fontWeight: '500',
                minWidth: '140px',
                width: 'auto',
                display: 'inline-flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                whiteSpace: 'pre-line',
              }}
            >
              <span style={{ lineHeight: 1.2 }}>
                Start Learning
              </span>
              <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>
                ({wordsData.length} words)
              </span>
            </button>
            <button
              onClick={() => window.location.href = '/flashcards/learn?mode=history'}
              style={{
                background: '#3b82f6',
                color: 'white',
                padding: '0.875rem 2rem',
                borderRadius: '0.75rem',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500',
                minWidth: '180px',
              }}
            >
              Revise Past Words
            </button>
            <button
              onClick={() => {
                setHasTodaySet(false);
                setTodaySet(null);
              }}
              style={{
                background: '#6b7280',
                color: 'white',
                padding: '0.875rem 2rem',
                borderRadius: '0.75rem',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500',
                minWidth: '180px',
              }}
            >
              Select New Words
            </button>
          </div>

          <div style={{
            display: 'grid',
            gap: '1rem',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            marginBottom: '2rem',
          }}>
            {wordsData.map((wordEntry: WordEntry, index: number) => (
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
                <div style={{ marginBottom: '0.75rem' }}>
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    color: '#1f2937',
                    margin: '0 0 0.25rem 0',
                  }}>
                    {wordEntry.word || 'Unknown word'}
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

                {wordEntry.definitions?.map((definition, defIndex) => (
                  <div key={defIndex} style={{ marginBottom: '0.75rem' }}>
                    <p style={{
                      fontSize: '0.875rem',
                      color: '#374151',
                      margin: '0 0 0.25rem 0',
                      lineHeight: '1.5',
                    }}>
                      <strong>EN:</strong> {definition.en_definition || 'No definition available'}
                    </p>
                    <p style={{
                      fontSize: '0.875rem',
                      color: '#059669',
                      margin: '0 0 0.25rem 0',
                      lineHeight: '1.5',
                    }}>
                      <strong>VI:</strong> {definition.vi_meaning || 'Không có định nghĩa'}
                    </p>
                  </div>
                ))}

                {wordEntry.definitions?.[0]?.examples?.length ? (
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
                          color: '#111827',
                          margin: '0 0 0.25rem 0',
                        }}>
                          {example.en || 'Example missing'}
                        </p>
                        <p style={{
                          fontSize: '0.8125rem',
                          color: '#047857',
                          margin: 0,
                        }}>
                          {example.vi || 'Không có ví dụ'}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          <div>
            {historyWords.length > 0 && (
              <div style={{
                marginTop: '2rem',
                textAlign: 'left',
                padding: '1.5rem',
                borderRadius: '1rem',
                background: '#ffffff',
                boxShadow: '0 4px 20px rgba(15, 23, 42, 0.05)',
              }}>
                <h2 style={{
                  margin: '0 0 0.5rem 0',
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  color: '#1f2937',
                }}>
                  Past Vocabulary (random {historyWords.length} words)
                </h2>
                <p style={{
                  margin: '0 0 1rem 0',
                  color: '#475569',
                  fontSize: '0.9rem',
                }}>
                  A rotating snapshot pulled from previous daily sets to help you revisit earlier cards.
                </p>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                  gap: '0.75rem',
                }}>
                  {historyWords.map((wordEntry, index) => {
                    const entryDefinition = wordEntry.definitions?.[0];
                    return (
                      <div
                        key={`${wordEntry.word}-${index}`}
                        style={{
                          background: '#f8fafc',
                          borderRadius: '0.75rem',
                          padding: '1rem',
                          border: '1px solid #e2e8f0',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.25rem',
                        }}
                      >
                        <span style={{
                          fontSize: '0.95rem',
                          fontWeight: '600',
                          color: '#0f172a',
                        }}>
                          {wordEntry.word}
                        </span>
                        <span style={{
                          fontSize: '0.8rem',
                          color: '#475569',
                        }}>
                          {entryDefinition?.vi_meaning || 'No meaning available'}
                        </span>
                        <span style={{
                          fontSize: '0.75rem',
                          color: '#0f172a',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '0.375rem',
                          background: '#e0f2fe',
                          alignSelf: 'flex-start',
                        }}>
                          {wordEntry.part_of_speech || 'word'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      paddingBottom: '2rem',
      background: 'linear-gradient(to bottom, #f8fafc 0%, #ffffff 100%)',
    }}>
      <div style={{
        maxWidth: '56rem',
        margin: '0 auto',
        padding: '2rem 1rem',
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '2rem',
        }}>
          <h1 style={{
            fontSize: 'clamp(1.75rem, 6vw, 2.25rem)',
            fontWeight: '700',
            color: '#2c4e6b',
            margin: '0 0 0.5rem 0',
          }}>
            Choose Your Daily Words
          </h1>
          <p style={{
            fontSize: 'clamp(0.875rem, 3.5vw, 1rem)',
            color: '#64748b',
            margin: 0,
          }}>
            Select exactly 20 words one by one for today ({today})
          </p>
        </div>

        {/* Individual Word Selection Interface */}
        {candidateWords.length > 0 ? (
          <>
            {/* Progress and Selection Status */}
            <div style={{
              textAlign: 'center',
              marginBottom: '2rem',
              background: 'white',
              borderRadius: '1rem',
              padding: '1.5rem',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
              }}>
                <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
                  Word {currentWordIndex + 1} of {candidateWords.length}
                </span>
                <span style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  color: selectedWords.length >= 20 ? '#10b981' : '#3b82f6'
                }}>
                  {selectedWords.length}/20 Selected
                </span>
              </div>

              <div style={{
                width: '100%',
                height: '8px',
                background: '#e5e7eb',
                borderRadius: '4px',
                overflow: 'hidden',
                marginBottom: '1rem',
              }}>
                <div style={{
                  width: `${(selectedWords.length / 20) * 100}%`,
                  height: '100%',
                  background: '#3b82f6',
                  transition: 'width 0.3s ease',
                }} />
              </div>

              {selectedWords.length >= 20 ? (
                <p style={{
                  color: '#10b981',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  margin: 0
                }}>
                  ✓ You have selected 20 words! Review and save when ready.
                </p>
              ) : selectedWords.length > 0 ? (
                <p style={{
                  color: '#3b82f6',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  margin: 0
                }}>
                  ✓ Word selected! Moving to next word...
                </p>
              ) : null}
            </div>

            {/* Current Word Display */}
            {currentCandidateWord && (
              <div style={{
                background: 'white',
                borderRadius: '1rem',
                padding: '2rem',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                marginBottom: '2rem',
                textAlign: 'center',
              }}>
                <h2 style={{
                  fontSize: '2rem',
                  fontWeight: '700',
                  color: '#1f2937',
                  margin: '0 0 0.5rem 0',
                }}>
                  {currentCandidateWord.word}
                </h2>

                {currentCandidateWord.phonetic && (
                  <p style={{
                    fontSize: '1rem',
                    color: '#6b7280',
                    margin: '0 0 1rem 0',
                    fontFamily: 'monospace',
                  }}>
                    {currentCandidateWord.phonetic}
                  </p>
                )}

                <div style={{
                  background: '#eff6ff',
                  color: '#1e40af',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  display: 'inline-block',
                  marginBottom: '1rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                }}>
                  {currentCandidateWord.part_of_speech}
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <p style={{
                    fontSize: '1rem',
                    color: '#374151',
                    margin: '0 0 0.5rem 0',
                    lineHeight: '1.5',
                  }}>
                    <strong>English:</strong> {currentCandidateDefinition?.en_definition || 'No definition available'}
                  </p>
                  <p style={{
                    fontSize: '1rem',
                    color: '#059669',
                    margin: 0,
                    lineHeight: '1.5',
                  }}>
                    <strong>Vietnamese:</strong> {currentCandidateDefinition?.vi_meaning || 'No meaning available'}
                  </p>
                </div>

                <button
                  onClick={() => toggleWordSelection(currentCandidateWord)}
                  disabled={!selectedWords.some(w => w.word === currentCandidateWord.word) && selectedWords.length >= 20}
                  style={{
                    background: selectedWords.some(w => w.word === currentCandidateWord.word)
                      ? '#10b981'
                      : selectedWords.length >= 20
                        ? '#9ca3af'
                        : '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    padding: '0.4rem 0.9rem',
                    cursor: selectedWords.length >= 20 && !selectedWords.some(w => w.word === currentCandidateWord.word)
                      ? 'not-allowed'
                      : 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: '500',
                    transition: 'background 0.2s, transform 0.2s',
                    minWidth: 'auto',
                    maxWidth: '150px',
                    margin: '0 auto',
                  }}
                >
                  {selectedWords.some(w => w.word === currentCandidateWord.word)
                    ? '✓ Selected'
                    : selectedWords.length >= 20
                      ? 'Limit Reached'
                      : 'Select & Continue'
                  }
                </button>
              </div>
            )}

            {/* Simple Navigation Controls */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: '2rem',
              gap: '1rem',
            }}>
              <button
                onClick={() => navigateToWord(Math.max(0, currentWordIndex - 1))}
                disabled={currentWordIndex === 0}
                style={{
                  background: currentWordIndex === 0 ? '#9ca3af' : '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.75rem',
                  padding: '0.75rem 1rem',
                  cursor: currentWordIndex === 0 ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                }}
              >
                ← Back
              </button>

              <span style={{
                fontSize: '0.875rem',
                color: '#64748b',
                fontWeight: '500',
              }}>
                {currentWordIndex + 1} of {candidateWords.length}
              </span>

              <button
                onClick={() => navigateToWord(Math.min(candidateWords.length - 1, currentWordIndex + 1))}
                disabled={currentWordIndex === candidateWords.length - 1}
                style={{
                  background: currentWordIndex === candidateWords.length - 1 ? '#9ca3af' : '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.75rem',
                  padding: '0.75rem 1rem',
                  cursor: currentWordIndex === candidateWords.length - 1 ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                }}
              >
                Skip →
              </button>
            </div>

            {/* Save Selected Words */}
            {selectedWords.length > 0 && (
              <div style={{
                textAlign: 'center',
                background: 'white',
                borderRadius: '1rem',
                padding: '1.5rem',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
              }}>
                <h3 style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#374151',
                  margin: '0 0 1rem 0',
                }}>
                  Selected Words Summary
                </h3>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                  justifyContent: 'center',
                  marginBottom: '1.5rem',
                  maxHeight: '6rem',
                  overflowY: 'auto',
                }}>
                  {selectedWords.map((word) => (
                    <span
                      key={word.word}
                      style={{
                        background: '#eff6ff',
                        color: '#1e40af',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.375rem',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                      }}
                    >
                      {word.word}
                    </span>
                  ))}
                </div>
                <button
                  onClick={saveSelectedWords}
                  disabled={selectedWords.length !== 20}
                  style={{
                    background: selectedWords.length === 20 ? '#10b981' : '#9ca3af',
                    color: 'white',
                    padding: '0.875rem 2rem',
                    borderRadius: '0.75rem',
                    border: 'none',
                    cursor: selectedWords.length === 20 ? 'pointer' : 'not-allowed',
                    fontSize: '1rem',
                    fontWeight: '500',
                  }}
                >
                  Save {selectedWords.length} Words & Start Learning
                </button>
              </div>
            )}
          </>
        ) : (
          /* Initial State - Generate Words Button */
          <div style={{
            textAlign: 'center',
            padding: '3rem 1rem',
          }}>
            <div style={{
              background: 'white',
              borderRadius: '1rem',
              padding: '2rem',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
              maxWidth: '32rem',
              margin: '0 auto',
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#374151',
                margin: '0 0 1rem 0',
              }}>
                Ready to choose your daily words?
              </h2>
              <p style={{
                color: '#64748b',
                margin: '0 0 2rem 0',
                lineHeight: '1.6',
              }}>
                Words will appear one by one. When you select a word, we'll automatically move to the next one. Choose exactly 20 words for today.
              </p>
              <button
                onClick={generateCandidateWords}
                disabled={loading}
                style={{
                  background: '#3b82f6',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.75rem',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600',
                  opacity: loading ? 0.6 : 1,
                  transition: 'opacity 0.2s',
                }}
              >
                {loading ? 'Loading words...' : 'Start Selecting Words'}
              </button>
            </div>
          </div>
        )}

          <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}
