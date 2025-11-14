'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
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

interface UserProgress {
  id: string;
  correctAnswers: string;
  incorrectAnswers: string;
  score: string;
}

export default function FlashcardLearnPage() {
  return (
    <Suspense fallback={
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
    }>
      <FlashcardLearnContent />
    </Suspense>
  );
}

function FlashcardLearnContent() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const isHistoryMode = searchParams.get('mode') === 'history';

  const [todayWords, setTodayWords] = useState<WordEntry[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState<number[]>([]);
  const [incorrectAnswers, setIncorrectAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<UserProgress | null>(null);

  function resetGameState() {
    setCurrentWordIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setCorrectAnswers([]);
    setIncorrectAnswers([]);
    setGameCompleted(false);
    setFinalScore(0);
    setProgress(null);
  }

  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

  useEffect(() => {
    if (!session?.user) return;
    resetGameState();
    if (isHistoryMode) {
      loadHistoryWords();
    } else {
      loadTodayWords();
    }
  }, [session, isHistoryMode]);

  useEffect(() => {
    if (todayWords.length > 0) {
      generateOptions();
    }
  }, [currentWordIndex, todayWords]);

  async function loadTodayWords() {
    try {
      setLoading(true);

      // Get today's word set
      const response = await fetch(`/api/flashcards/daily-set?date=${today}`);
      if (!response.ok) {
        throw new Error('Failed to load today\'s words');
      }

      const data = await response.json();
      if (!data.set) {
        // No words for today, redirect to selection page
        window.location.href = '/flashcards/select';
        return;
      }

      let wordsData: unknown = JSON.parse(data.set.wordData);
      if (typeof wordsData === 'string') {
        wordsData = JSON.parse(wordsData);
      }
      const normalizedWords = (Array.isArray(wordsData) ? wordsData : []).map(normalizeWordEntry);
      setTodayWords(normalizedWords);

      // Check if user already has progress for today
      const progressResponse = await fetch(`/api/flashcards/progress?date=${today}`);
      if (progressResponse.ok) {
        const progressData = await progressResponse.json();
        if (progressData.progress) {
          setProgress(progressData.progress);
          const parsedCorrect = JSON.parse(progressData.progress.correctAnswers);
          const parsedIncorrect = JSON.parse(progressData.progress.incorrectAnswers);
          setCorrectAnswers(parsedCorrect);
          setIncorrectAnswers(parsedIncorrect);

          // If all words have been answered, show results
          const totalWordsCount = Array.isArray(wordsData) ? wordsData.length : normalizedWords.length;
          if (parsedCorrect.length + parsedIncorrect.length === totalWordsCount) {
            setGameCompleted(true);
            setFinalScore(parseInt(progressData.progress.score));
          }
        }
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load words');
    } finally {
      setLoading(false);
    }
  }

  async function loadHistoryWords() {
    try {
      setLoading(true);
      const response = await fetch('/api/flashcards/daily-set');
      if (!response.ok) {
        throw new Error('Failed to load past words');
      }

      const data = await response.json();
      const wordsData = Array.isArray(data.historyWords) ? data.historyWords : [];
      const normalizedWords = wordsData.map(normalizeWordEntry);
      setTodayWords(normalizedWords);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load past words');
    } finally {
      setLoading(false);
    }
  }

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

  function generateOptions() {
    if (todayWords.length === 0) return;

    const currentWord = todayWords[currentWordIndex];
    if (!currentWord || !currentWord.definitions || currentWord.definitions.length === 0) {
      return;
    }

    const correctAnswer = currentWord.definitions[0]?.vi_meaning || '';

    // Get random Vietnamese meanings from other words
    const otherMeanings = todayWords
      .filter((_, index) => index !== currentWordIndex)
      .map(word => word.definitions[0]?.vi_meaning)
      .filter(meaning => meaning && meaning !== correctAnswer);

    // Randomly select 3 incorrect options and shuffle them with the correct one
    const shuffledOptions = [correctAnswer];
    while (shuffledOptions.length < 4 && otherMeanings.length > 0) {
      const randomIndex = Math.floor(Math.random() * otherMeanings.length);
      const meaning = otherMeanings.splice(randomIndex, 1)[0];
      if (meaning && !shuffledOptions.includes(meaning)) {
        shuffledOptions.push(meaning);
      }
    }

    // If we don't have enough options, add some generic ones
    const fallbackOptions = ['Tôi không biết', 'Không chắc chắn', 'Cần xem lại'];
    while (shuffledOptions.length < 4) {
      const fallback = fallbackOptions[shuffledOptions.length - 1];
      if (!shuffledOptions.includes(fallback)) {
        shuffledOptions.push(fallback);
      }
    }

    // Shuffle the options
    const shuffled = shuffledOptions.sort(() => 0.5 - Math.random());
    setOptions(shuffled);
  }

  function handleAnswerSelect(answer: string) {
    if (selectedAnswer) return; // Prevent double selection

    setSelectedAnswer(answer);

    const currentWord = todayWords[currentWordIndex];
    if (!currentWord || !currentWord.definitions || currentWord.definitions.length === 0) {
      return;
    }

    const correctAnswer = currentWord.definitions[0]?.vi_meaning || '';
    const isCorrect = answer === correctAnswer;

    if (isCorrect) {
      setCorrectAnswers(prev => [...prev, currentWordIndex]);
    } else {
      setIncorrectAnswers(prev => [...prev, currentWordIndex]);
    }

    setShowResult(true);
  }

  async function handleNext() {
    if (currentWordIndex < todayWords.length - 1) {
      setCurrentWordIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      if (isHistoryMode) {
        finalizeHistorySession();
      } else {
        await saveProgress();
      }
    }
  }

  async function saveProgress() {
    try {
      const score = Math.round((correctAnswers.length / todayWords.length) * 100);

      await fetch('/api/flashcards/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: today,
          correctAnswers: JSON.stringify(correctAnswers),
          incorrectAnswers: JSON.stringify(incorrectAnswers),
          score: score.toString(),
        }),
      });

      setGameCompleted(true);
      setFinalScore(score);

    } catch (err) {
      console.error('Failed to save progress:', err);
    }
  }

  function finalizeHistorySession() {
    const score = todayWords.length > 0
      ? Math.round((correctAnswers.length / todayWords.length) * 100)
      : 0;
    setFinalScore(score);
    setGameCompleted(true);
  }

  function restartGame() {
    setCurrentWordIndex(0);
    setCorrectAnswers([]);
    setIncorrectAnswers([]);
    setSelectedAnswer(null);
    setShowResult(false);
    setGameCompleted(false);
    setFinalScore(0);
  }

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
        }}>
          <h2 style={{ color: '#374151', marginBottom: '1rem' }}>Please log in to use flashcards</h2>
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
            }}
          >
            Go to Login
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
            onClick={() => window.location.href = '/flashcards/select'}
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
            Back to Selection
          </button>
        </div>
      </div>
    );
  }

  // Game completed - show results
  if (gameCompleted) {
    const totalWords = todayWords.length;
    const correctCount = correctAnswers.length;
    const incorrectCount = incorrectAnswers.length;

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
            Learning Complete! 🎉
          </h1>

          <div style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
            marginBottom: '2rem',
          }}>
            <div style={{
              fontSize: '3rem',
              fontWeight: '700',
              color: finalScore >= 80 ? '#10b981' : finalScore >= 60 ? '#f59e0b' : '#ef4444',
              marginBottom: '1rem',
            }}>
              {finalScore}%
            </div>
            <p style={{ color: '#64748b', marginBottom: '2rem' }}>
              You answered {correctCount} out of {totalWords} words correctly
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              marginBottom: '2rem',
            }}>
              <div style={{
                padding: '1rem',
                background: '#f0fdf4',
                borderRadius: '0.5rem',
                border: '1px solid #bbf7d0',
              }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#10b981' }}>
                  {correctCount}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#059669' }}>Correct</div>
              </div>
              <div style={{
                padding: '1rem',
                background: '#fef2f2',
                borderRadius: '0.5rem',
                border: '1px solid #fecaca',
              }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#ef4444' }}>
                  {incorrectCount}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#dc2626' }}>Incorrect</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              onClick={restartGame}
              style={{
                background: '#3b82f6',
                color: 'white',
                padding: '0.875rem 2rem',
                borderRadius: '0.75rem',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500',
              }}
            >
              Practice Again
            </button>
            <button
              onClick={() => window.location.href = '/flashcards/select'}
              style={{
                background: '#10b981',
                color: 'white',
                padding: '0.875rem 2rem',
                borderRadius: '0.75rem',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500',
              }}
            >
              New Word Set
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (todayWords.length === 0) {
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
          <h2 style={{ color: '#374151', marginBottom: '1rem' }}>
            {isHistoryMode ? 'No past words to revise yet' : 'No words for today'}
          </h2>
          <p style={{ color: '#64748b', marginBottom: '1rem' }}>
            {isHistoryMode ? 'Select and save some sets so you can revise past words later.' : 'Please select your daily words first.'}
          </p>
          <button
            onClick={() => window.location.href = '/flashcards/select'}
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
            Select Words
          </button>
        </div>
      </div>
    );
  }

  const currentWord = todayWords[currentWordIndex];
  const progressPercent = ((currentWordIndex + (showResult ? 1 : 0)) / todayWords.length) * 100;
  const isCorrect = selectedAnswer === (currentWord.definitions[0]?.vi_meaning || '');

  return (
    <div style={{
      minHeight: '100vh',
      paddingBottom: '2rem',
      background: 'linear-gradient(to bottom, #f8fafc 0%, #ffffff 100%)',
    }}>
      <div style={{
        maxWidth: '32rem',
        margin: '0 auto',
        padding: '2rem 1rem',
      }}>
        {/* Progress Bar */}
        <div style={{
          marginBottom: '2rem',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.5rem',
          }}>
            <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
              Word {currentWordIndex + 1} of {todayWords.length}
            </span>
            <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
              {Math.round(progressPercent)}%
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '8px',
            background: '#e5e7eb',
            borderRadius: '4px',
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${progressPercent}%`,
              height: '100%',
              background: '#3b82f6',
              transition: 'width 0.3s ease',
            }} />
          </div>
        </div>

        {/* Current Word */}
        <div style={{
          background: 'white',
          borderRadius: '1rem',
          padding: '2rem',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
          marginBottom: '2rem',
          textAlign: 'center',
        }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: '#1f2937',
            margin: '0 0 0.5rem 0',
          }}>
            {currentWord.word}
          </h1>
          {currentWord.phonetic && (
            <p style={{
              fontSize: '1rem',
              color: '#6b7280',
              margin: '0 0 1rem 0',
              fontFamily: 'monospace',
            }}>
              {currentWord.phonetic}
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
            {currentWord.part_of_speech}
          </div>
          <p style={{
            fontSize: '1.125rem',
            color: '#374151',
            margin: '0 0 1rem 0',
            fontStyle: 'italic',
          }}>
            "{currentWord.definitions[0]?.en_definition || 'No definition available'}"
          </p>
        </div>

        {/* Answer Options */}
        <div style={{
          display: 'grid',
          gap: '0.75rem',
          marginBottom: '2rem',
        }}>
          {options.map((option, index) => {
            let buttonStyle = {
              background: 'white',
              border: '2px solid #e5e7eb',
              color: '#374151',
              padding: '1rem',
              borderRadius: '0.75rem',
              cursor: 'pointer',
              fontSize: '1rem',
              textAlign: 'left' as const,
              transition: 'all 0.2s',
            };

            if (selectedAnswer) {
              const correctAnswer = currentWord.definitions[0]?.vi_meaning || '';
              if (option === correctAnswer) {
                buttonStyle = {
                  ...buttonStyle,
                  background: '#f0fdf4',
                  border: '2px solid #10b981',
                  color: '#059669',
                };
              } else if (option === selectedAnswer && option !== correctAnswer) {
                buttonStyle = {
                  ...buttonStyle,
                  background: '#fef2f2',
                  border: '2px solid #ef4444',
                  color: '#dc2626',
                };
              }
            }

            return (
              <button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                disabled={selectedAnswer !== null}
                style={buttonStyle}
              >
                <span style={{
                  display: 'inline-block',
                  width: '1.5rem',
                  height: '1.5rem',
                  borderRadius: '50%',
                  background: '#e5e7eb',
                  color: '#6b7280',
                  textAlign: 'center',
                  lineHeight: '1.5rem',
                  marginRight: '0.75rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                }}>
                  {String.fromCharCode(65 + index)}
                </span>
                {option}
              </button>
            );
          })}
        </div>

        {/* Result and Next Button */}
        {showResult && (
          <div style={{
            textAlign: 'center',
            background: 'white',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          }}>
            <div style={{
              fontSize: '2rem',
              marginBottom: '0.5rem',
            }}>
              {isCorrect ? '✅' : '❌'}
            </div>
            <p style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: isCorrect ? '#10b981' : '#ef4444',
              margin: '0 0 0.5rem 0',
            }}>
              {isCorrect ? 'Correct!' : 'Incorrect'}
            </p>
            {!isCorrect && (
              <p style={{
                fontSize: '1rem',
                color: '#374151',
                margin: '0 0 1rem 0',
              }}>
                Correct answer: <strong>{currentWord.definitions[0]?.vi_meaning || 'No meaning available'}</strong>
              </p>
            )}
            <button
              onClick={handleNext}
              style={{
                background: '#3b82f6',
                color: 'white',
                padding: '0.875rem 2rem',
                borderRadius: '0.75rem',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500',
              }}
            >
              {currentWordIndex < todayWords.length - 1 ? 'Next Word' : 'Complete Game'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
