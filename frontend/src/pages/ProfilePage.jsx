import React, { useState, useEffect } from 'react';
import { User, Mail, Building, Lock, Trash2, Save, Eye, EyeOff, Bell } from 'lucide-react';
import { changePassword } from '../api/auth.js';  // ← 추가

export default function ProfilePage() {
  // 프로필 데이터 상태
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    company: ''
  });

  // 알림 설정 상태
  const [notifications, setNotifications] = useState({
    email: false,
    sms: false,
    push: false
  });

  // 비밀번호 변경 모달 상태
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [passwordLoading, setPasswordLoading] = useState(false);   // ← 추가: 모달 로딩
  const [passwordError, setPasswordError] = useState('');           // ← 추가: 모달 에러

  // 계정 삭제 모달 상태
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // 로그인 정보에서 프로필 데이터 로드
  useEffect(() => {
    const loadProfileFromLogin = () => {
      const userEmail = localStorage.getItem('cosy_user_email') || '';
      const initialProfile = {
        username: userEmail.split('@')[0] || 'user',
        email: userEmail,
        company: ''
      };
      setProfileData(initialProfile);
    };
    loadProfileFromLogin();
  }, []);

  /**
   * UX 개선: 입력 시 공백 제거 핸들러
   */
  const handleInputChange = (field, value) => {
    const cleanValue = value.replace(/\s/g, "");
    setProfileData({
      ...profileData,
      [field]: cleanValue
    });
  };

  const handlePasswordInputChange = (field, value) => {
    const cleanValue = value.replace(/\s/g, "");
    setPasswordData({
      ...passwordData,
      [`${field}Password`]: cleanValue
    });
    // 입력 중 에러 메시지 소거
    if (passwordError) setPasswordError('');
  };

  // 알림 토글 핸들러
  const handleNotificationToggle = (type) => {
    setNotifications({
      ...notifications,
      [type]: !notifications[type]
    });
  };

  // 전체 설정 저장 핸들러
  const handleSave = () => {
    console.log('저장될 데이터:', { profileData, notifications });
    alert('프로필 및 알림 설정이 저장되었습니다.');
  };

  // ─── 비밀번호 변경 핸들러 (API 호출) ────────────────────────
  const handlePasswordChange = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordData;

    // 1) 프론트 유효성 검사
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('모든 필드를 입력해주세요.');
      return;
    }
    if (newPassword.length < 10) {
      setPasswordError('새 비밀번호는 최소 10자 이상이어야 합니다.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    // 2) API 호출
    setPasswordLoading(true);
    setPasswordError('');

    try {
      const token = localStorage.getItem('cosy_access_token');
      await changePassword(token, currentPassword, newPassword);

      // 성공
      alert('비밀번호가 성공적으로 변경되었습니다.');
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      // 백엔드 에러 메시지 우선, 없으면 기본문구
      setPasswordError(error.data?.message || '비밀번호 변경에 실패했습니다.');
    } finally {
      setPasswordLoading(false);
    }
  };
  // ─────────────────────────────────────────────────────────────

  // 계정 삭제 핸들러
  const handleDeleteAccount = () => {
    if (deleteConfirmText !== '삭제') {
      alert('"삭제"를 정확히 입력해주세요.');
      return;
    }
    if (window.confirm('정말로 계정을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) {
      alert('계정이 삭제되었습니다.');
      localStorage.clear();
      window.location.reload();
    }
  };

  // 토글 스위치 컴포넌트
  const ToggleSwitch = ({ checked, onChange }) => (
    <label style={{ position: 'relative', display: 'inline-block', width: '40px', height: '20px' }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        style={{ opacity: 0, width: 0, height: 0 }}
      />
      <span style={{
        position: 'absolute',
        cursor: 'pointer',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: checked ? '#3b82f6' : '#ccc',
        transition: '.4s',
        borderRadius: '20px'
      }}>
        <span style={{
          position: 'absolute',
          content: '""',
          height: '14px', width: '14px',
          left: checked ? '23px' : '3px',
          bottom: '3px',
          backgroundColor: 'white',
          transition: '.4s',
          borderRadius: '50%'
        }}></span>
      </span>
    </label>
  );

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto', backgroundColor: '#f3f4f6', padding: '32px' }}>

      {/* Header */}
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '900px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>마이 페이지</h1>
          <p style={{ color: '#6b7280', marginTop: '8px' }}>계정 정보 및 알림 설정을 관리합니다</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px', maxWidth: '900px' }}>

        {/* Left Column - 기본 정보 */}
        <div style={{ backgroundColor: '#d1d5db', padding: '24px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontWeight: 'bold', color: '#1f2937', fontSize: '18px', margin: 0 }}>기본 정보</h3>
            <button
              onClick={handleSave}
              style={{
                padding: '8px 16px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Save size={16} /> 저장하기
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* 사용자 이름 */}
            <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <User size={20} color="#6b7280" />
                <label style={{ fontSize: '14px', fontWeight: '600', color: '#4b5563' }}>사용자 이름</label>
              </div>
              <input
                type="text"
                value={profileData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="공백 없이 입력하세요"
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' }}
              />
            </div>
            {/* 이메일 */}
            <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <Mail size={20} color="#6b7280" />
                <label style={{ fontSize: '14px', fontWeight: '600', color: '#4b5563' }}>이메일</label>
              </div>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' }}
              />
            </div>
            {/* 회사명 */}
            <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <Building size={20} color="#6b7280" />
                <label style={{ fontSize: '14px', fontWeight: '600', color: '#4b5563' }}>회사명</label>
              </div>
              <input
                type="text"
                value={profileData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                placeholder="회사명을 입력하세요"
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' }}
              />
            </div>
          </div>
        </div>

        {/* Right Column - 알림 설정 및 계정 관리 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ backgroundColor: '#d1d5db', padding: '24px', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <Bell size={18} color="#1f2937" />
              <h3 style={{ fontWeight: 'bold', color: '#1f2937', fontSize: '18px', margin: 0 }}>알림 설정</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {['email', 'sms', 'push'].map((type) => (
                <div key={type} style={{ backgroundColor: 'white', padding: '12px 16px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: '#4b5563', textTransform: 'uppercase', fontWeight: '500' }}>{type} 알림</span>
                  <ToggleSwitch
                    checked={notifications[type]}
                    onChange={() => handleNotificationToggle(type)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div style={{ backgroundColor: '#d1d5db', padding: '24px', borderRadius: '8px', height: 'fit-content' }}>
            <h3 style={{ fontWeight: 'bold', color: '#1f2937', marginBottom: '16px', fontSize: '18px', marginTop: 0 }}>계정 관리</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button onClick={() => setShowPasswordModal(true)} style={{ padding: '12px 16px', backgroundColor: 'white', color: '#1f2937', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lock size={16} /> 비밀번호 변경
              </button>
              <button onClick={() => setShowDeleteModal(true)} style={{ padding: '12px 16px', backgroundColor: 'white', color: '#dc2626', border: '1px solid #dc2626', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Trash2 size={16} /> 계정 삭제
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 비밀번호 변경 모달 */}
      {showPasswordModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '32px', width: '90%', maxWidth: '500px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '24px' }}>비밀번호 변경</h2>

            {/* 에러 메시지 — LoginPage와 동일한 스타일 */}
            {passwordError && (
              <div style={{
                backgroundColor: '#FEF2F2',
                border: '1px solid #FCA5A5',
                color: '#991B1B',
                borderRadius: '8px',
                padding: '10px 12px',
                fontSize: '13px',
                marginBottom: '16px'
              }}>
                {passwordError}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {['current', 'new', 'confirm'].map((field) => (
                <div key={field}>
                  <label style={{ fontSize: '14px', fontWeight: '600', color: '#4b5563', display: 'block', marginBottom: '8px' }}>
                    {field === 'current' ? '현재 비밀번호' : field === 'new' ? '새 비밀번호 (최소 10자)' : '새 비밀번호 확인'}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPasswords[field] ? 'text' : 'password'}
                      value={passwordData[`${field}Password`]}
                      onChange={(e) => handlePasswordInputChange(field, e.target.value)}
                      placeholder={field === 'new' ? '10자 이상 입력하세요' : ''}
                      disabled={passwordLoading}
                      style={{ width: '100%', padding: '10px 40px 10px 12px', border: '1px solid #d1d5db', borderRadius: '4px', boxSizing: 'border-box', opacity: passwordLoading ? 0.6 : 1 }}
                    />
                    <button onClick={() => setShowPasswords({ ...showPasswords, [field]: !showPasswords[field] })} disabled={passwordLoading} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: passwordLoading ? 'not-allowed' : 'pointer' }}>
                      {showPasswords[field] ? <EyeOff size={20} color="#6b7280" /> : <Eye size={20} color="#6b7280" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
              <button
                onClick={() => { setShowPasswordModal(false); setPasswordError(''); setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' }); }}
                disabled={passwordLoading}
                style={{ flex: 1, padding: '12px', backgroundColor: 'white', border: '1px solid #d1d5db', borderRadius: '6px', cursor: passwordLoading ? 'not-allowed' : 'pointer', opacity: passwordLoading ? 0.6 : 1 }}
              >
                취소
              </button>
              <button
                onClick={handlePasswordChange}
                disabled={passwordLoading}
                style={{ flex: 1, padding: '12px', backgroundColor: passwordLoading ? '#93c5fd' : '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: passwordLoading ? 'not-allowed' : 'pointer' }}
              >
                {passwordLoading ? '변경 중...' : '변경하기'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 계정 삭제 모달 */}
      {showDeleteModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '32px', width: '90%', maxWidth: '500px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px' }}>계정 삭제</h2>
            <p style={{ color: '#4b5563', marginBottom: '24px' }}>정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.</p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value.replace(/\s/g, ""))}
              placeholder='"삭제"를 입력하세요'
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '4px', boxSizing: 'border-box', marginBottom: '24px' }}
            />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); }} style={{ flex: 1, padding: '12px', backgroundColor: 'white', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer' }}>취소</button>
              <button onClick={handleDeleteAccount} disabled={deleteConfirmText !== '삭제'} style={{ flex: 1, padding: '12px', backgroundColor: deleteConfirmText === '삭제' ? '#dc2626' : '#9ca3af', color: 'white', border: 'none', borderRadius: '6px', cursor: deleteConfirmText === '삭제' ? 'pointer' : 'not-allowed' }}>삭제하기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
