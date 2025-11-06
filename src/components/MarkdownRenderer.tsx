'use client';

import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // Enhanced markdown parser with mobile-optimized styling
  const renderContent = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactElement[] = [];
    let currentList: any[] = [];
    let listKey = 0;
    let definitionCounter = 0;

    const flushList = () => {
      if (currentList.length > 0) {
        elements.push(
          <ul
            key={`list-${listKey++}`}
            style={{
              margin: '1rem 0 1.5rem 0',
              paddingLeft: '1.25rem',
              listStyleType: 'none',
              borderLeft: '4px solid #10b981',
              paddingTop: '0.5rem',
              paddingBottom: '0.5rem',
              paddingRight: '0',
            }}
          >
            {currentList.map((item, idx) => (
              <li
                key={idx}
                style={{
                  marginBottom: idx === currentList.length - 1 ? '0' : '0.625rem',
                  paddingLeft: '1.25rem',
                  position: 'relative',
                  fontSize: '1.0625rem',
                  lineHeight: '1.75',
                  color: '#374151',
                  fontWeight: '500',
                }}
              >
                <span style={{
                  position: 'absolute',
                  left: '0',
                  top: '0.7em',
                  width: '6px',
                  height: '6px',
                  backgroundColor: '#10b981',
                  borderRadius: '50%',
                }} />
                {item}
              </li>
            ))}
          </ul>
        );
        currentList = [];
      }
    };

    lines.forEach((line, index) => {
      // Bold headings - Main titles and section headers
      if (line.startsWith('**') && line.endsWith('**')) {
        flushList();
        const text = line.slice(2, -2);
        const isPhonetic = text.match(/\/.*\//); // Detect phonetic notation

        elements.push(
          <h3
            key={index}
            style={{
              fontWeight: '700',
              fontSize: isPhonetic ? '1.25rem' : '1.625rem',
              marginTop: index === 0 ? '0' : '1.75rem',
              marginBottom: '1rem',
              color: isPhonetic ? '#6366f1' : '#0f172a',
              lineHeight: '1.3',
              letterSpacing: isPhonetic ? '0.01em' : '-0.015em',
              paddingBottom: '0.75rem',
              borderBottom: isPhonetic ? 'none' : '3px solid #e0e7ff',
              background: isPhonetic ? 'linear-gradient(to right, #eef2ff, transparent)' : 'none',
              padding: isPhonetic ? '0.5rem 1rem' : '0 0 0.75rem 0',
              borderRadius: isPhonetic ? '6px' : '0',
            }}
          >
            {text}
          </h3>
        );
      }
      // List items - Examples and bullet points
      else if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const text = line.trim().slice(2);
        const parts = text.split(/(\*\*.*?\*\*)/g);
        const rendered = parts.map((part, i) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong
                key={i}
                style={{
                  fontWeight: '700',
                  color: '#047857',
                }}
              >
                {part.slice(2, -2)}
              </strong>
            );
          }
          return part;
        });
        currentList.push(rendered);
      }
      // Numbered list items - Individual definitions
      else if (/^\d+\.\s/.test(line.trim())) {
        flushList();
        definitionCounter++;
        const numberMatch = line.trim().match(/^(\d+)\.\s(.*)$/);
        const number = numberMatch?.[1] || definitionCounter.toString();
        const text = numberMatch?.[2] || line.trim().replace(/^\d+\.\s/, '');

        const parts = text.split(/(\*\*.*?\*\*)/g);
        const rendered = parts.map((part, i) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong
                key={i}
                style={{
                  fontWeight: '700',
                  color: '#1e40af',
                  fontSize: '1.0625rem',
                }}
              >
                {part.slice(2, -2)}
              </strong>
            );
          }
          return part;
        });

        elements.push(
          <div
            key={index}
            style={{
              marginBottom: '1.25rem',
              padding: '1rem 1rem 1rem 3.5rem',
              background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
              borderLeft: '5px solid #3b82f6',
              borderRadius: '0 10px 10px 0',
              boxShadow: '0 2px 8px rgba(59, 130, 246, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)',
              position: 'relative',
            }}
          >
            <div style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '32px',
              height: '32px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              color: 'white',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '0.9375rem',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)',
              border: '2px solid white',
            }}>
              {number}
            </div>
            <div
              style={{
                fontWeight: '500',
                color: '#1e3a8a',
                lineHeight: '1.75',
                fontSize: '1.0625rem',
              }}
            >
              {rendered}
            </div>
          </div>
        );
      }
      // Empty line - Reset definition counter on major breaks
      else if (line.trim() === '') {
        flushList();
        // Add subtle spacing
        if (elements.length > 0 && elements[elements.length - 1].key !== `spacing-${index}`) {
          elements.push(
            <div
              key={`spacing-${index}`}
              style={{ height: '0.5rem' }}
            />
          );
        }
      }
      // Regular text - Part of speech, descriptions
      else if (line.trim()) {
        flushList();
        const parts = line.split(/(\*\*.*?\*\*)/g);
        const rendered = parts.map((part, i) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong
                key={i}
                style={{
                  fontWeight: '700',
                  color: '#7c3aed',
                  background: 'linear-gradient(to right, #f5f3ff, transparent)',
                  padding: '0.125rem 0.5rem',
                  borderRadius: '4px',
                }}
              >
                {part.slice(2, -2)}
              </strong>
            );
          }
          return part;
        });

        elements.push(
          <p
            key={index}
            style={{
              marginBottom: '0.875rem',
              lineHeight: '1.75',
              color: '#475569',
              fontSize: '1.0625rem',
              fontWeight: '500',
              letterSpacing: '0.005em',
            }}
          >
            {rendered}
          </p>
        );
      }
    });

    flushList();
    return elements;
  };

  return (
    <div
      style={{
        fontSize: '1rem',
        lineHeight: '1.75',
        wordBreak: 'break-word',
        overflowWrap: 'break-word',
        width: '100%',
        maxWidth: '100%',
        padding: '0.5rem',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      }}
    >
      {renderContent(content)}
    </div>
  );
}

