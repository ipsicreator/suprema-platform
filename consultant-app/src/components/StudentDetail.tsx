import React, { useEffect, useState } from 'react';
import { ArrowLeft, Save, Printer } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './StudentDetail.css';

interface StudentDetailProps {
  studentData: { id: string; name: string } | null;
  onBack: () => void;
}

const StudentDetail: React.FC<StudentDetailProps> = ({ studentData, onBack }) => {
  const [inputText, setInputText] = useState('');
  const [analysisResult, setAnalysisResult] = useState('');
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
          <textarea value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="학생 활동/교과 내용을 입력" />
          <div className="actions">
            <button className="btn-primary" onClick={runAnalysis}>분석 실행</button>
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
