'use client';

import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // Simple markdown parser for our specific format
  const renderContent = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactElement[] = [];
    let currentList: any[] = [];
    let listKey = 0;

    const flushList = () => {
      if (currentList.length > 0) {
        elements.push(
          <ul key={`list-${listKey++}`} style={{
            marginLeft: '1.5rem',
            marginBottom: '0.75rem',
            listStyleType: 'disc',
          }}>
            {currentList.map((item, idx) => (
              <li key={idx} style={{ marginBottom: '0.25rem' }}>{item}</li>
            ))}
          </ul>
        );
        currentList = [];
      }
    };

    lines.forEach((line, index) => {
      // Bold text with **
      if (line.startsWith('**') && line.endsWith('**')) {
        flushList();
        const text = line.slice(2, -2);
        elements.push(
          <h3 key={index} style={{ 
            fontWeight: 'bold', 
            fontSize: '1.25rem',
            marginBottom: '0.5rem',
            color: '#1f2937',
          }}>
            {text}
          </h3>
        );
      }
      // List items starting with - or *
      else if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const text = line.trim().slice(2);
        // Parse inline bold
        const parts = text.split(/(\*\*.*?\*\*)/g);
        const rendered = parts.map((part, i) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i}>{part.slice(2, -2)}</strong>;
          }
          return part;
        });
        currentList.push(rendered);
      }
      // Numbered list items
      else if (/^\d+\.\s/.test(line.trim())) {
        flushList();
        const text = line.trim().replace(/^\d+\.\s/, '');
        // Parse inline bold
        const parts = text.split(/(\*\*.*?\*\*)/g);
        const rendered = parts.map((part, i) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} style={{ fontWeight: '600', color: '#374151' }}>{part.slice(2, -2)}</strong>;
          }
          return part;
        });
        elements.push(
          <div key={index} style={{ 
            marginBottom: '1rem',
            paddingLeft: '0.5rem',
            borderLeft: '3px solid #e5e7eb',
          }}>
            <div style={{ fontWeight: '500', color: '#1f2937', lineHeight: '1.6' }}>
              {rendered}
            </div>
          </div>
        );
      }
      // Empty line
      else if (line.trim() === '') {
        flushList();
      }
      // Regular text
      else if (line.trim()) {
        flushList();
        // Parse inline bold
        const parts = line.split(/(\*\*.*?\*\*)/g);
        const rendered = parts.map((part, i) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} style={{ fontWeight: '600' }}>{part.slice(2, -2)}</strong>;
          }
          return part;
        });
        elements.push(
          <p key={index} style={{ 
            marginBottom: '0.5rem',
            lineHeight: '1.6',
            color: '#4b5563',
          }}>
            {rendered}
          </p>
        );
      }
    });

    flushList();
    return elements;
  };

  return (
    <div style={{
      fontSize: '1rem',
      lineHeight: '1.75',
    }}>
      {renderContent(content)}
    </div>
  );
}

