'use client';

import { useState, useEffect, useRef } from 'react';
import { translate, getWordSuggestions, addBookmark } from '@/app/actions/translation';
import type { Language } from '@/lib/ai';
import { MarkdownRenderer } from './MarkdownRenderer';

interface MobileTranslationInterfaceProps {
  isAuthenticated: boolean;
}

export function MobileTranslationInterface({ isAuthenticated }: MobileTranslationInterfaceProps) {
  const [sourceLanguage, setSourceLanguage] = useState<Language>('en');
  const [targetLanguage, setTargetLanguage] = useState<Language>('vi');
  const [inputText, setInputText] = useState('');
  const [translation, setTranslation] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isWord, setIsWord] = useState(false);
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isClickingDropdown = useRef(false);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (inputText.length > 0 && !translation) {
        const results = await getWordSuggestions(inputText, sourceLanguage);
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [inputText, sourceLanguage, translation]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    if (showSuggestions) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSuggestions]);

  const handleTranslate = async (text: string = inputText, regenerate: boolean = false) => {
    if (!text.trim()) return;

    setLoading(true);
    setMessage('');
    setShowSuggestions(false);

    if (inputRef.current) {
      inputRef.current.blur();
    }

    const result = await translate(text, sourceLanguage, targetLanguage, regenerate);

    if (result.error) {
      setMessage(result.error);
      setTranslation('');
    } else {
      setTranslation(result.translation || '');
      setIsWord(result.isWord || false);
      if (result.fromCache && !regenerate) {
        setMessage('💾 From cache');
      }
    }

    setLoading(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    isClickingDropdown.current = false;
    setInputText(suggestion);
    setShowSuggestions(false);
    handleTranslate(suggestion);
  };

  const handleSwapLanguages = () => {
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage);
    setInputText('');
    setTranslation('');
    setSuggestions([]);
    setShowSuggestions(false);
    setMessage('');
  };

  const handleBookmark = async () => {
    if (!isWord || !inputText.trim() || !translation) return;

    const result = await addBookmark(inputText, sourceLanguage, translation);

    if (result.error) {
      setMessage(result.error);
    } else {
      setMessage('⭐ Bookmarked!');
    }
  };

  const handleRegenerate = () => {
    handleTranslate(inputText, true);
  };

  const handleClear = () => {
    setInputText('');
    setTranslation('');
    setSuggestions([]);
    setShowSuggestions(false);
    setMessage('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div style={{
      maxWidth: '56rem',
      width: '100%',
      margin: '0 auto',
    }}>
      {/* Language Switcher - Sticky on mobile */}
      <div style={{
        display: 'flex',
        gap: '0.75rem',
        marginBottom: '1.5rem',
        background: '#ffffff',
        padding: '0.875rem',
        borderRadius: '1rem',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        border: '1px solid #e5e7eb',
        position: 'sticky',
        top: '73px',
        zIndex: 10,
      }}>
        <button
          className={`btn ${sourceLanguage === 'en' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => {
            setSourceLanguage('en');
            setTargetLanguage('vi');
            handleClear();
          }}
          style={{
            flex: 1,
            fontSize: '0.9375rem',
            fontWeight: '600',
            borderRadius: '0.75rem',
          }}
        >
          EN → VI
        </button>

        <button
          onClick={handleSwapLanguages}
          className="btn btn-secondary"
          style={{
            padding: '0.75rem',
            minWidth: '48px',
            borderRadius: '0.75rem',
            fontWeight: '600',
          }}
          title="Swap"
          aria-label="Swap languages"
        >
          ⇄
        </button>

        <button
          className={`btn ${sourceLanguage === 'vi' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => {
            setSourceLanguage('vi');
            setTargetLanguage('en');
            handleClear();
          }}
          style={{
            flex: 1,
            fontSize: '0.9375rem',
            fontWeight: '600',
            borderRadius: '0.75rem',
          }}
        >
          VI → EN
        </button>
      </div>

      {/* Main Card */}
      <div className="card" style={{
        borderRadius: '1rem',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        border: '1px solid #e5e7eb',
      }}>
        {/* Input Section */}
        <div style={{ position: 'relative', marginBottom: '1rem' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.5rem',
          }}>
            <label style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#475569',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              {sourceLanguage === 'en' ? '🇬🇧 English' : '🇻🇳 Vietnamese'}
            </label>
            {inputText && (
              <button
                onClick={handleClear}
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #e5e7eb',
                  color: '#64748b',
                  cursor: 'pointer',
                  fontSize: '0.8125rem',
                  padding: '0.375rem 0.75rem',
                  borderRadius: '0.5rem',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#e2e8f0';
                  e.currentTarget.style.color = '#475569';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f1f5f9';
                  e.currentTarget.style.color = '#64748b';
                }}
              >
                ✕ Clear
              </button>
            )}
          </div>

          <textarea
            ref={inputRef}
            rows={8}
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              // Clear translation when user starts typing new text
              if (translation) {
                setTranslation('');
                setMessage('');
              }
            }}
            placeholder={`Type ${sourceLanguage === 'en' ? 'English' : 'Vietnamese'} text...`}
            className="input"
            style={{
              minHeight: '140px',
              resize: 'vertical',
              fontSize: '16px',
              lineHeight: '1.6',
              padding: '1rem',
              borderRadius: '0.75rem',
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                handleTranslate();
              }
            }}
            onBlur={() => {
              if (!isClickingDropdown.current) {
                setShowSuggestions(false);
              }
            }}
            onFocus={() => {
              if (suggestions.length > 0 && inputText.length > 0 && !translation) {
                setShowSuggestions(true);
              }
            }}
          />

          {/* Suggestions Dropdown - Mobile Optimized */}
          {showSuggestions && suggestions.length > 0 && (
            <div
              ref={dropdownRef}
              onMouseDown={() => {
                isClickingDropdown.current = true;
              }}
              onMouseUp={() => {
                isClickingDropdown.current = false;
              }}
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '0.75rem',
                marginTop: '0.5rem',
                maxHeight: '240px',
                overflowY: 'auto',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                zIndex: 20,
              }}
            >
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  onClick={() => {
                    handleSuggestionClick(suggestion);
                    isClickingDropdown.current = false;
                  }}
                  style={{
                    padding: '1rem',
                    cursor: 'pointer',
                    borderBottom: index < suggestions.length - 1 ? '1px solid #f1f5f9' : 'none',
                    fontSize: '1rem',
                    minHeight: '52px',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: translation ? '1.5rem' : '0',
          flexWrap: 'wrap',
        }}>
          <button
            onClick={() => handleTranslate()}
            disabled={loading || !inputText.trim()}
            className="btn btn-primary"
            style={{
              flex: '1 1 auto',
              minWidth: '120px',
              fontSize: '1rem',
              fontWeight: '600',
              borderRadius: '0.75rem',
              padding: '0.875rem 1.5rem',
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <span className="loading-spinner">⟳</span> Translating...
              </span>
            ) : (
              '🔍 Translate'
            )}
          </button>

          {translation && (
            <>
              <button
                onClick={handleRegenerate}
                disabled={loading}
                className="btn btn-secondary"
                style={{
                  minWidth: '48px',
                  borderRadius: '0.75rem',
                  fontWeight: '600',
                }}
                title="Regenerate"
              >
                🔄
              </button>

              {isWord && isAuthenticated && (
                <button
                  onClick={handleBookmark}
                  className="btn btn-secondary"
                  style={{
                    minWidth: '48px',
                    borderRadius: '0.75rem',
                    fontWeight: '600',
                  }}
                  title="Bookmark"
                >
                  ⭐
                </button>
              )}
            </>
          )}
        </div>

        {/* Message */}
        {message && (
          <div style={{
            padding: '0.875rem 1rem',
            background: message.includes('error') || message.includes('Error')
              ? 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)'
              : 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            color: message.includes('error') || message.includes('Error') ? '#dc2626' : '#16a34a',
            borderRadius: '0.75rem',
            marginBottom: '1rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            border: message.includes('error') || message.includes('Error')
              ? '1px solid #fecaca'
              : '1px solid #bbf7d0',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <span>{message}</span>
          </div>
        )}

        {/* Translation Result */}
        {translation && (
          <>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.75rem',
            }}>
              <label style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#475569',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                {targetLanguage === 'en' ? '🇬🇧 English' : '🇻🇳 Vietnamese'}
              </label>

              <a
                href={`https://translate.google.com/?sl=${sourceLanguage}&tl=${targetLanguage}&text=${encodeURIComponent(inputText)}&op=translate`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: '0.875rem',
                  color: '#2563eb',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '0.375rem',
                  background: '#eff6ff',
                  border: '1px solid #dbeafe',
                }}
              >
                🔊 Google Translate
              </a>
            </div>

            <div style={{ padding: '0.5rem' }}>
              <MarkdownRenderer content={translation} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

