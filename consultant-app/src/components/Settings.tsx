import React, { useEffect, useState } from 'react';
import { Settings as SettingsIcon, Database, FileDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './Settings.css';

const Settings: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);

  const fetchLibrary = async () => {
    const { data } = await supabase.from('exploration_library').select('*').order('created', { ascending: false });
    setItems(data || []);
  };

  useEffect(() => {
    fetchLibrary();
  }, []);

  return (
    <div className="settings-view">
      <div className="detail-header glass-panel">
        <div className="title-area">
          <SettingsIcon size={24} className="accent-icon" />
          <h2>설정</h2>
        </div>
      </div>

      <div className="settings-layout">
        <div className="settings-content glass-panel" style={{ width: '100%' }}>
          <h3><Database size={18} /> 탐구 라이브러리 상태</h3>
          <p>총 항목: {items.length}개</p>
          <p>데이터 소스: PocketBase</p>

          <div style={{ marginTop: 12 }}>
            <h4><FileDown size={16} /> 최근 항목</h4>
            <ul>
              {items.slice(0, 10).map((item) => (
                <li key={item.id}>{item.book_title || item.inquiry_title || '제목 없음'}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
