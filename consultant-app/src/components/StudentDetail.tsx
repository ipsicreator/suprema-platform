import React, { useEffect, useState } from 'react';
import { ArrowLeft, Save, Printer } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { analyzeStudentReportSmart } from '../lib/gemini';
import './StudentDetail.css';

interface StudentDetailProps {
  studentData: { id: string; name: string } | null;
  onBack: () => void;
}

const StudentDetail: React.FC<StudentDetailProps> = ({ studentData, onBack }) => {
  const [inputText, setInputText] = useState('');
  const [analysisResult, setAnalysisResult] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzingFile, setIsAnalyzingFile] = useState(false);
  const [fileTypeHint, setFileTypeHint] = useState('');
  const [history, setHistory] = useState<any[]>([]);

  const loadHistory = async () => {
    if (!studentData?.id) return;
    const { data } = await supabase.from('pdf_analyses').select('*').eq('student_id', studentData.id).order('created', { ascending: false });
    setHistory(data || []);
  };

  useEffect(() => {
    loadHistory();
  }, [studentData?.id]);

  const runAnalysis = () => {
    if (!inputText.trim()) return;
    setAnalysisResult(`요약: ${inputText.slice(0, 120)}\n\n역량: 자기주도/탐구/협업\n진로적합: 데이터 기반으로 보통 이상`);
  };

  const detectMimeFromSignature = async (file: File): Promise<string> => {
    const header = new Uint8Array(await file.slice(0, 12).arrayBuffer());
    const hex = Array.from(header).map((b) => b.toString(16).padStart(2, '0')).join('');

    if (hex.startsWith('25504446')) return 'application/pdf'; // %PDF
    if (hex.startsWith('89504e470d0a1a0a')) return 'image/png'; // PNG
    if (hex.startsWith('ffd8ff')) return 'image/jpeg'; // JPG
    if (hex.startsWith('52494646') && hex.slice(16, 24) === '57454250') return 'image/webp'; // RIFF....WEBP
    return file.type || 'application/octet-stream';
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (!file) {
      setSelectedFile(null);
      setFileTypeHint('');
      return;
    }

    const detectedMime = await detectMimeFromSignature(file);
    const allowedMime = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];
    if (!allowedMime.includes(detectedMime)) {
      alert('PDF/PNG/JPG/WEBP 파일만 업로드할 수 있습니다.');
      event.target.value = '';
      setSelectedFile(null);
      setFileTypeHint('');
      return;
    }

    const normalizedFile =
      file.type === detectedMime ? file : new File([file], file.name, { type: detectedMime });

    setSelectedFile(normalizedFile);
    if (file.type !== detectedMime) {
      setFileTypeHint(`파일 헤더 기준 실제 형식: ${detectedMime} (확장자/브라우저 인식과 다름)`);
    } else {
      setFileTypeHint(`파일 형식 확인: ${detectedMime}`);
    }
  };

  const runFileAnalysis = async () => {
    if (!selectedFile) {
      alert('먼저 파일을 선택해 주세요.');
      return;
    }

    setIsAnalyzingFile(true);
    try {
      const result = await analyzeStudentReportSmart(selectedFile);
      const summary = typeof result?.analysisSummary === 'string' ? result.analysisSummary : '요약 정보 없음';
      const grades = Array.isArray(result?.grades) ? result.grades : [];
      const activities = Array.isArray(result?.activities) ? result.activities : [];

      const gradeLines = grades
        .map((g: any) => `- ${g.semester || '-'} / ${g.subject || '-'} / 성취 ${g.score || '-'} / 비고 ${g.note || '-'}`)
        .join('\n');

      const activityLines = activities
        .map((a: any) => `- ${a.title || '-'}: ${a.detail || '-'}`)
        .join('\n');

      setAnalysisResult(
        [
          `요약: ${summary}`,
          '',
          '성적/교과 분석',
          gradeLines || '- 추출된 항목 없음',
          '',
          '활동 분석',
          activityLines || '- 추출된 항목 없음',
        ].join('\n')
      );
    } catch (error: any) {
      alert(error?.message || '파일 분석 중 오류가 발생했습니다.');
    } finally {
      setIsAnalyzingFile(false);
    }
  };

  const saveResult = async () => {
    if (!studentData?.id || !analysisResult) return;
    await supabase.from('pdf_analyses').insert({ student_id: studentData.id, content: { analysis_summary: analysisResult } });
    loadHistory();
  };

  const printResult = () => {
    window.print();
  };

  return (
    <div className="student-detail fade-in">
      <header className="detail-header glass-panel">
        <button className="back-btn" onClick={onBack}><ArrowLeft size={18} /></button>
        <h3>{studentData?.name || '학생'} 분석</h3>
      </header>

      <div className="detail-grid">
        <section className="scan-section glass-panel">
          <h4>입력</h4>
          <input
            type="file"
            accept=".pdf,image/png,image/jpeg,image/webp"
            onChange={handleFileChange}
            style={{ marginBottom: 12 }}
          />
          {selectedFile && (
            <p style={{ margin: '0 0 10px 0', fontSize: 13, color: 'var(--text-muted)' }}>
              선택 파일: {selectedFile.name}
            </p>
          )}
          {fileTypeHint && (
            <p style={{ margin: '0 0 10px 0', fontSize: 12, color: '#93c5fd' }}>
              {fileTypeHint}
            </p>
          )}
          <textarea value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="학생 활동/교과 내용을 입력" />
          <div className="actions">
            <button className="btn-primary" onClick={runAnalysis}>분석 실행</button>
            <button className="btn-primary" onClick={runFileAnalysis} disabled={isAnalyzingFile}>
              {isAnalyzingFile ? '파일 분석 중...' : '파일 분석 실행'}
            </button>
            <button className="btn-save" onClick={saveResult}><Save size={14} />저장</button>
            <button className="btn-save" onClick={printResult}><Printer size={14} />출력하기</button>
          </div>
        </section>

        <section className="report-section glass-panel">
          <h4>결과</h4>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{analysisResult || '아직 결과가 없습니다.'}</pre>
          <h4 style={{ marginTop: 16 }}>경과(저장 이력)</h4>
          <ul>
            {history.map((h) => <li key={h.id}>{new Date(h.created || h.created_at || Date.now()).toLocaleString()}</li>)}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default StudentDetail;
