"use client";

import { isCommonText } from '../../../../lib/utils/evaluationLogic';

interface SepecViewerProps {
  sepecData: { term: string; subject: string; text: string }[];
  keyword: string;
}

export default function SepecViewer({ sepecData, keyword }: SepecViewerProps) {
  const highlightText = (text: string) => {
    if (!keyword.trim()) return text;
    const parts = text.split(new RegExp(`(${keyword})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === keyword.toLowerCase() 
        ? <mark key={i} style={{ backgroundColor: '#fef08a', padding: '0 0.2rem', borderRadius: '0.2rem', fontWeight: 'bold' }}>{part}</mark> 
        : part
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {sepecData.map((s, i) => {
        const isCommon = isCommonText(s.text);
        return (
          <div key={i} style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', backgroundColor: isCommon ? '#fef2f2' : '#f8fafc' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 600, color: '#334155' }}>[{s.term}] {s.subject}</span>
              {isCommon && <span style={{ fontSize: '0.75rem', backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.2rem 0.5rem', borderRadius: '0.25rem' }}>⚠ 흔한 표현/단순 나열</span>}
            </div>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569', lineHeight: '1.6' }}>
              {highlightText(s.text)}
            </p>
          </div>
        );
      })}
    </div>
  );
}
