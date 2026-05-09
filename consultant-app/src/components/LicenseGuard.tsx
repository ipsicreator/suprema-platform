import React, { useState, useEffect } from 'react';
import { ShieldAlert, PhoneCall } from 'lucide-react';
import { pb } from '../lib/pocketbase';

interface LicenseGuardProps {
  children: React.ReactNode;
}

const LicenseGuard: React.FC<LicenseGuardProps> = ({ children }) => {
  const [licenseStatus, setLicenseStatus] = useState<{ active: boolean; loading: boolean }>({
    active: true,
    loading: false, // 로딩 없이 즉시 통과
  });

  useEffect(() => {
    // 라이선스 체크를 항상 활성 상태로 강제합니다.
    setLicenseStatus({ active: true, loading: false });
  }, []);

  if (licenseStatus.loading) {
    return (
      <div className="license-loading">
        <div className="spinner"></div>
        <p>시스템을 초기화 중입니다...</p>
      </div>
    );
  }

  if (!licenseStatus.active) {
    return (
      <div className="license-blocked-overlay">
        <div className="license-card glass-panel">
          <ShieldAlert size={64} color="#ff4d4f" />
          <h1>접속 불가</h1>
          <button 
            className="btn-primary" 
            onClick={() => pb.authStore.clear()}
          >
            초기화
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default LicenseGuard;
