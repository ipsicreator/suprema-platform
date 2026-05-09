import React, { useEffect, useState } from 'react';
import { UserPlus, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './Dashboard.css';

interface Student {
  id: string;
  name: string;
  school?: string;
  grade?: string;
  enrollment_status?: string;
  created?: string;
  created_at?: string;
}

interface DashboardProps {
  onSelectStudent: (id: string, name: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onSelectStudent }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [newStudent, setNewStudent] = useState({ name: '', school: '', grade: '' });

  const fetchStudents = async () => {
    setLoading(true);
    const { data } = await supabase.from('students').select('*').order('created', { ascending: false });
    setStudents((data || []) as Student[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const createStudent = async () => {
    if (!newStudent.name.trim()) return;
    await supabase.from('students').insert({
      name: newStudent.name,
      school: newStudent.school,
      grade: newStudent.grade,
      enrollment_status: '신규',
    });
    setNewStudent({ name: '', school: '', grade: '' });
    fetchStudents();
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header glass-panel">
        <h2>학생 CRM 관리</h2>
      </header>

      <section className="student-list-section glass-panel" style={{ marginTop: 16 }}>
        <h3>학생 등록</h3>
        <div style={{ display: 'grid', gap: 8, gridTemplateColumns: '2fr 2fr 1fr auto', marginBottom: 16 }}>
          <input placeholder="이름" value={newStudent.name} onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })} />
          <input placeholder="학교" value={newStudent.school} onChange={(e) => setNewStudent({ ...newStudent, school: e.target.value })} />
          <input placeholder="학년" value={newStudent.grade} onChange={(e) => setNewStudent({ ...newStudent, grade: e.target.value })} />
          <button className="btn-primary" onClick={createStudent}><UserPlus size={16} />추가</button>
        </div>

        <h3>학생 목록</h3>
        {loading ? <p>불러오는 중...</p> : (
          <table className="student-table">
            <thead><tr><th>이름</th><th>학교</th><th>학년</th><th>상태</th><th>상세</th></tr></thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>{s.school || '-'}</td>
                  <td>{s.grade || '-'}</td>
                  <td>{s.enrollment_status || '신규'}</td>
                  <td>
                    <button className="action-btn" onClick={() => onSelectStudent(s.id, s.name)}>
                      분석 이동 <ArrowRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
