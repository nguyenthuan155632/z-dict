'use client';

import { useState, useEffect, useRef } from 'react';
import { translate, getWordSuggestions, addBookmark } from '@/app/actions/translation';
import type { Language } from '@/lib/ai';
import { MarkdownRenderer } from './MarkdownRenderer';

interface TranslationInterfaceProps {
  isAuthenticated: boolean;
}

export function TranslationInterface({ isAuthenticated }: TranslationInterfaceProps) {
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
      if (inputText.length > 0) {
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
  }, [inputText, sourceLanguage]);

  const handleTranslate = async (text: string = inputText, regenerate: boolean = false) => {
    if (!text.trim()) return;

    setLoading(true);
    setMessage('');
    setShowSuggestions(false);

    // Blur input to hide suggestions
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
        setMessage('Translation loaded from cache');
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
  };

  const handleBookmark = async () => {
    if (!isWord || !inputText.trim()) return;

    const result = await addBookmark(inputText.trim(), sourceLanguage, translation);
    if (result.error) {
      setMessage(result.error);
    } else {
      setMessage('Word bookmarked successfully!');
    }
  };

  const handleRegenerate = () => {
    handleTranslate(inputText, true);
  };

  return (
    <div className="card" style={{ maxWidth: '56rem', width: '100%', margin: '2rem auto' }}>
      {/* Language Switcher */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
        <button
          className={`btn ${sourceLanguage === 'en' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => {
            setSourceLanguage('en');
            setTargetLanguage('vi');
            setInputText('');
            setTranslation('');
            setSuggestions([]);
            setShowSuggestions(false);
            setMessage('');
          }}
          style={{ flex: 1 }}
        >
          English → Vietnamese
        </button>

        <button
          onClick={handleSwapLanguages}
          className="btn btn-secondary"
          style={{ padding: '0.5rem' }}
          title="Swap languages"
        >
          ⇄
        </button>

        <button
          className={`btn ${sourceLanguage === 'vi' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => {
            setSourceLanguage('vi');
            setTargetLanguage('en');
            setInputText('');
            setTranslation('');
            setSuggestions([]);
            setShowSuggestions(false);
            setMessage('');
          }}
          style={{ flex: 1 }}
        >
          Vietnamese → English
        </button>
      </div>

      {/* Input Section */}
      <div style={{ position: 'relative', marginBottom: '1rem' }}>
        <textarea
          ref={inputRef}
          value={inputText}
          onChange={(e) => {
            setInputText(e.target.value);
            // Clear translation when user starts typing new text
            if (translation) {
              setTranslation('');
              setMessage('');
            }
          }}
          placeholder={`Enter ${sourceLanguage === 'en' ? 'English' : 'Vietnamese'} text...`}
          className="input"
          style={{ minHeight: '120px', resize: 'vertical' }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              handleTranslate();
            }
          }}
          onBlur={() => {
            // Only hide if not clicking on dropdown
            if (!isClickingDropdown.current) {
              setShowSuggestions(false);
            }
          }}
          onFocus={() => {
            if (suggestions.length > 0 && inputText.length > 0) {
              setShowSuggestions(true);
            }
          }}
        />

        {/* Suggestions Dropdown */}
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
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              marginTop: '0.25rem',
              maxHeight: '200px',
              overflowY: 'auto',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              zIndex: 10
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
                  padding: '0.75rem',
                  cursor: 'pointer',
                  borderBottom: index < suggestions.length - 1 ? '1px solid #f3f4f6' : 'none'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button
          onClick={() => handleTranslate()}
          disabled={loading || !inputText.trim()}
          className="btn btn-primary"
          style={{ flex: 1 }}
        >
          {loading ? 'Translating...' : 'Translate'}
        </button>

        {translation && (
          <>
            <button
              onClick={handleRegenerate}
              disabled={loading}
              className="btn btn-secondary"
            >
              🔄 Regenerate
            </button>

            {isWord && isAuthenticated && (
              <button
                onClick={handleBookmark}
                className="btn btn-secondary"
                title="Bookmark this word"
              >
                ⭐ Bookmark
              </button>
            )}
          </>
        )}
      </div>

      {/* Message */}
      {message && (
        <div style={{
          padding: '0.75rem',
          background: message.includes('error') || message.includes('already') ? '#fee2e2' : '#d1fae5',
          color: message.includes('error') || message.includes('already') ? '#991b1b' : '#065f46',
          borderRadius: '0.375rem',
          marginBottom: '1rem'
        }}>
          {message}
        </div>
      )}

      {/* Translation Output */}
      {translation && (
        <>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#374151', margin: 0, marginBottom: '1rem' }}>
            Translation:
          </h3>
          <a
            href={`https://translate.google.com/?sl=${sourceLanguage}&tl=${targetLanguage}&text=${encodeURIComponent(inputText)}&op=translate`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: '0.875rem',
              color: '#2563eb',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.375rem 0.75rem',
              borderRadius: '0.375rem',
              background: '#eff6ff',
              border: '1px solid #dbeafe',
              marginBottom: '1rem',
            }}
          >
            🔊 Listen on Google Translate
          </a>
          <MarkdownRenderer content={translation} />
        </>
      )}
    </div>
  );
}

