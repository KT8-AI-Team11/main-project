import React, { useState, useEffect } from 'react';
import { User, Mail, Building, Phone, Bell, Lock, Trash2, Save, Edit2, X, Eye, EyeOff } from 'lucide-react';
import { getMe, changePassword, deleteAccount } from '../api/auth';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    company: '',
    phone: '',
    department: '',
    position: ''
  });

  const [tempData, setTempData] = useState({ ...profileData });
  const [notifications, setNotifications] = useState({
    email: false,
    sms: false,
    push: false
  });
  const [tempNotifications, setTempNotifications] = useState({ ...notifications });

  // 비밀번호 변경 모달
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

  // 계정 삭제 모달
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // 로그인 정보에서 프로필 데이터 로드
  useEffect(() => {
    const loadProfile = async () => {
      const accessToken = localStorage.getItem('cosy_access_token');

      if (!accessToken) {
        console.error('로그인 토큰이 없습니다.');
        return;
      }

      try {
        const response = await getMe(accessToken);
        const initialProfile = {
          username: response.email?.split('@')[0] || 'user',
          email: response.email || '',
          company: response.companyName || '',
          phone: '',
          department: '',
          position: ''
        };

        setProfileData(initialProfile);
        setTempData(initialProfile);
      } catch (error) {
        console.error('프로필 로드 실패:', error);
        // 에러 시 localStorage에서 기본 정보 로드
        const userEmail = localStorage.getItem('cosy_user_email') || '';
        const fallbackProfile = {
          username: userEmail.split('@')[0] || 'user',
          email: userEmail,
          company: '',
          phone: '',
          department: '',
          position: ''
        };
        setProfileData(fallbackProfile);
        setTempData(fallbackProfile);
      }
    };

    loadProfile();
  }, []); // 컴포넌트 마운트 시 한 번만 실행

  const handleEdit = () => {
    setIsEditing(true);
    setTempData({ ...profileData });
    setTempNotifications({ ...notifications });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setTempData({ ...profileData });
    setTempNotifications({ ...notifications });
  };

  const handleSave = () => {
    // TODO: 실제 API 호출로 프로필 저장
    // try {
    //   await fetch('/api/profile', {
    //     method: 'PUT',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(tempData)
    //   });
    // } catch (error) {
    //   alert('프로필 저장에 실패했습니다.');
    //   return;
    // }

    setProfileData({ ...tempData });
    setNotifications({ ...tempNotifications });
    setIsEditing(false);
    alert('프로필이 저장되었습니다.');
  };

  const handleInputChange = (field, value) => {
    setTempData({
      ...tempData,
      [field]: value
    });
  };

  const handleNotificationToggle = (type) => {
    setTempNotifications({
      ...tempNotifications,
      [type]: !tempNotifications[type]
    });
  };

  // 비밀번호 변경 핸들러
  const handlePasswordChange = async () => {
    // 유효성 검사
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      alert('새 비밀번호는 최소 8자 이상이어야 합니다.');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    const accessToken = localStorage.getItem('cosy_access_token');
    if (!accessToken) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      await changePassword(accessToken, passwordData.currentPassword, passwordData.newPassword);
      alert('비밀번호가 성공적으로 변경되었습니다. 다시 로그인해주세요.');
      // 비밀번호 변경 시 보안상 로그아웃 처리
      localStorage.removeItem('cosy_access_token');
      localStorage.removeItem('cosy_logged_in');
      localStorage.removeItem('cosy_user_email');
      window.location.reload();
    } catch (error) {
      alert('비밀번호 변경에 실패했습니다: ' + (error.message || '알 수 없는 오류'));
    }
  };

  // 계정 삭제 핸들러
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== '삭제') {
      alert('"삭제"를 정확히 입력해주세요.');
      return;
    }

    const confirmed = window.confirm(
      '정말로 계정을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.'
    );

    if (confirmed) {
      const accessToken = localStorage.getItem('cosy_access_token');
      if (!accessToken) {
        alert('로그인이 필요합니다.');
        return;
      }

      try {
        await deleteAccount(accessToken);
        alert('계정이 삭제되었습니다.');
        localStorage.removeItem('cosy_access_token');
        localStorage.removeItem('cosy_logged_in');
        localStorage.removeItem('cosy_user_email');
        window.location.reload();
      } catch (error) {
        alert('계정 삭제에 실패했습니다: ' + (error.message || '알 수 없는 오류'));
      }
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto', backgroundColor: '#f3f4f6', padding: '32px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>프로필 설정</h1>
          <p style={{ color: '#6b7280', marginTop: '8px' }}>계정 정보 및 알림 설정을 관리합니다</p>
        </div>
        {!isEditing ? (
          <button
            onClick={handleEdit}
            style={{
              padding: '12px 24px',
              backgroundColor: '#1f2937',
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
            <Edit2 style={{ width: '16px', height: '16px' }} />
            수정하기
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleCancel}
              style={{
                padding: '12px 24px',
                backgroundColor: 'white',
                color: '#1f2937',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <X style={{ width: '16px', height: '16px' }} />
              취소
            </button>
            <button
              onClick={handleSave}
              style={{
                padding: '12px 24px',
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
              <Save style={{ width: '16px', height: '16px' }} />
              저장
            </button>
          </div>
        )}
      </div>

      {/* Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Left Column - Basic Info */}
        <div style={{ backgroundColor: '#d1d5db', padding: '24px', borderRadius: '8px' }}>
          <h3 style={{ fontWeight: 'bold', color: '#1f2937', marginBottom: '24px', margin: '0 0 24px 0', fontSize: '18px' }}>기본 정보</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Username */}
            <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <User style={{ width: '20px', height: '20px', color: '#6b7280' }} />
                <label style={{ fontSize: '14px', fontWeight: '600', color: '#4b5563' }}>사용자 이름</label>
              </div>
              <input
                type="text"
                value={isEditing ? tempData.username : profileData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                disabled={!isEditing}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '14px',
                  backgroundColor: isEditing ? 'white' : '#f9fafb',
                  cursor: isEditing ? 'text' : 'not-allowed',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Email */}
            <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <Mail style={{ width: '20px', height: '20px', color: '#6b7280' }} />
                <label style={{ fontSize: '14px', fontWeight: '600', color: '#4b5563' }}>이메일</label>
              </div>
              <input
                type="email"
                value={isEditing ? tempData.email : profileData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={!isEditing}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '14px',
                  backgroundColor: isEditing ? 'white' : '#f9fafb',
                  cursor: isEditing ? 'text' : 'not-allowed',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Company */}
            <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <Building style={{ width: '20px', height: '20px', color: '#6b7280' }} />
                <label style={{ fontSize: '14px', fontWeight: '600', color: '#4b5563' }}>회사명</label>
              </div>
              <input
                type="text"
                value={isEditing ? tempData.company : profileData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                disabled={!isEditing}
                placeholder="회사명을 입력하세요"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '14px',
                  backgroundColor: isEditing ? 'white' : '#f9fafb',
                  cursor: isEditing ? 'text' : 'not-allowed',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Phone */}
            <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <Phone style={{ width: '20px', height: '20px', color: '#6b7280' }} />
                <label style={{ fontSize: '14px', fontWeight: '600', color: '#4b5563' }}>전화번호</label>
              </div>
              <input
                type="tel"
                value={isEditing ? tempData.phone : profileData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                disabled={!isEditing}
                placeholder="010-0000-0000"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '14px',
                  backgroundColor: isEditing ? 'white' : '#f9fafb',
                  cursor: isEditing ? 'text' : 'not-allowed',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Department */}
            <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <Building style={{ width: '20px', height: '20px', color: '#6b7280' }} />
                <label style={{ fontSize: '14px', fontWeight: '600', color: '#4b5563' }}>부서</label>
              </div>
              <input
                type="text"
                value={isEditing ? tempData.department : profileData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                disabled={!isEditing}
                placeholder="부서명을 입력하세요"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '14px',
                  backgroundColor: isEditing ? 'white' : '#f9fafb',
                  cursor: isEditing ? 'text' : 'not-allowed',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Position */}
            <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <User style={{ width: '20px', height: '20px', color: '#6b7280' }} />
                <label style={{ fontSize: '14px', fontWeight: '600', color: '#4b5563' }}>직책</label>
              </div>
              <input
                type="text"
                value={isEditing ? tempData.position : profileData.position}
                onChange={(e) => handleInputChange('position', e.target.value)}
                disabled={!isEditing}
                placeholder="직책을 입력하세요"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '14px',
                  backgroundColor: isEditing ? 'white' : '#f9fafb',
                  cursor: isEditing ? 'text' : 'not-allowed',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>
        </div>

        {/* Right Column - Notifications & Account */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Notification Settings */}
          <div style={{ backgroundColor: '#d1d5db', padding: '24px', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <Bell style={{ width: '20px', height: '20px', color: '#1f2937' }} />
              <h3 style={{ fontWeight: 'bold', color: '#1f2937', margin: 0, fontSize: '18px' }}>알림 설정</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Email Notification */}
              <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>이메일 알림</span>
                  <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '24px' }}>
                    <input
                      type="checkbox"
                      checked={isEditing ? tempNotifications.email : notifications.email}
                      onChange={() => handleNotificationToggle('email')}
                      disabled={!isEditing}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span style={{
                      position: 'absolute',
                      cursor: isEditing ? 'pointer' : 'not-allowed',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: (isEditing ? tempNotifications.email : notifications.email) ? '#3b82f6' : '#d1d5db',
                      transition: '0.4s',
                      borderRadius: '24px',
                      opacity: isEditing ? 1 : 0.6
                    }}>
                      <span style={{
                        position: 'absolute',
                        content: '',
                        height: '18px',
                        width: '18px',
                        left: (isEditing ? tempNotifications.email : notifications.email) ? '26px' : '3px',
                        bottom: '3px',
                        backgroundColor: 'white',
                        transition: '0.4s',
                        borderRadius: '50%'
                      }}></span>
                    </span>
                  </label>
                </div>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>중요한 업데이트를 이메일로 받습니다</p>
              </div>

              {/* SMS Notification */}
              <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>SMS 알림</span>
                  <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '24px' }}>
                    <input
                      type="checkbox"
                      checked={isEditing ? tempNotifications.sms : notifications.sms}
                      onChange={() => handleNotificationToggle('sms')}
                      disabled={!isEditing}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span style={{
                      position: 'absolute',
                      cursor: isEditing ? 'pointer' : 'not-allowed',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: (isEditing ? tempNotifications.sms : notifications.sms) ? '#3b82f6' : '#d1d5db',
                      transition: '0.4s',
                      borderRadius: '24px',
                      opacity: isEditing ? 1 : 0.6
                    }}>
                      <span style={{
                        position: 'absolute',
                        content: '',
                        height: '18px',
                        width: '18px',
                        left: (isEditing ? tempNotifications.sms : notifications.sms) ? '26px' : '3px',
                        bottom: '3px',
                        backgroundColor: 'white',
                        transition: '0.4s',
                        borderRadius: '50%'
                      }}></span>
                    </span>
                  </label>
                </div>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>긴급 알림을 문자로 받습니다</p>
              </div>

              {/* Push Notification */}
              <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>푸시 알림</span>
                  <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '24px' }}>
                    <input
                      type="checkbox"
                      checked={isEditing ? tempNotifications.push : notifications.push}
                      onChange={() => handleNotificationToggle('push')}
                      disabled={!isEditing}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span style={{
                      position: 'absolute',
                      cursor: isEditing ? 'pointer' : 'not-allowed',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: (isEditing ? tempNotifications.push : notifications.push) ? '#3b82f6' : '#d1d5db',
                      transition: '0.4s',
                      borderRadius: '24px',
                      opacity: isEditing ? 1 : 0.6
                    }}>
                      <span style={{
                        position: 'absolute',
                        content: '',
                        height: '18px',
                        width: '18px',
                        left: (isEditing ? tempNotifications.push : notifications.push) ? '26px' : '3px',
                        bottom: '3px',
                        backgroundColor: 'white',
                        transition: '0.4s',
                        borderRadius: '50%'
                      }}></span>
                    </span>
                  </label>
                </div>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>앱 푸시 알림을 받습니다</p>
              </div>
            </div>
          </div>

          {/* Account Management */}
          <div style={{ backgroundColor: '#d1d5db', padding: '24px', borderRadius: '8px' }}>
            <h3 style={{ fontWeight: 'bold', color: '#1f2937', marginBottom: '16px', margin: '0 0 16px 0', fontSize: '18px' }}>계정 관리</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={() => setShowPasswordModal(true)}
                style={{
                  padding: '12px 16px',
                  backgroundColor: 'white',
                  color: '#1f2937',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
              >
                <Lock style={{ width: '16px', height: '16px' }} />
                비밀번호 변경
              </button>

              <button
                onClick={() => setShowDeleteModal(true)}
                style={{
                  padding: '12px 16px',
                  backgroundColor: 'white',
                  color: '#dc2626',
                  border: '1px solid #dc2626',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#dc2626';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.color = '#dc2626';
                }}
              >
                <Trash2 style={{ width: '16px', height: '16px' }} />
                계정 삭제
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 비밀번호 변경 모달 */}
      {showPasswordModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '32px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '24px' }}>
              비밀번호 변경
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* 현재 비밀번호 */}
              <div>
                <label style={{ fontSize: '14px', fontWeight: '600', color: '#4b5563', display: 'block', marginBottom: '8px' }}>
                  현재 비밀번호
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 40px 10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    {showPasswords.current ?
                      <EyeOff style={{ width: '20px', height: '20px', color: '#6b7280' }} /> :
                      <Eye style={{ width: '20px', height: '20px', color: '#6b7280' }} />
                    }
                  </button>
                </div>
              </div>

              {/* 새 비밀번호 */}
              <div>
                <label style={{ fontSize: '14px', fontWeight: '600', color: '#4b5563', display: 'block', marginBottom: '8px' }}>
                  새 비밀번호 (최소 8자)
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 40px 10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    {showPasswords.new ?
                      <EyeOff style={{ width: '20px', height: '20px', color: '#6b7280' }} /> :
                      <Eye style={{ width: '20px', height: '20px', color: '#6b7280' }} />
                    }
                  </button>
                </div>
              </div>

              {/* 새 비밀번호 확인 */}
              <div>
                <label style={{ fontSize: '14px', fontWeight: '600', color: '#4b5563', display: 'block', marginBottom: '8px' }}>
                  새 비밀번호 확인
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 40px 10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    {showPasswords.confirm ?
                      <EyeOff style={{ width: '20px', height: '20px', color: '#6b7280' }} /> :
                      <Eye style={{ width: '20px', height: '20px', color: '#6b7280' }} />
                    }
                  </button>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: 'white',
                  color: '#1f2937',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                취소
              </button>
              <button
                onClick={handlePasswordChange}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                변경하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 계정 삭제 모달 */}
      {showDeleteModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '32px',
            width: '90%',
            maxWidth: '500px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#fee2e2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Trash2 style={{ width: '24px', height: '24px', color: '#dc2626' }} />
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                계정 삭제
              </h2>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <p style={{ color: '#4b5563', marginBottom: '16px', lineHeight: '1.6' }}>
                정말로 계정을 삭제하시겠습니까?
              </p>
              <div style={{
                backgroundColor: '#fef3c7',
                padding: '16px',
                borderRadius: '6px',
                border: '1px solid #fbbf24',
                marginBottom: '16px'
              }}>
                <p style={{ color: '#92400e', fontSize: '14px', margin: 0, lineHeight: '1.5' }}>
                  <strong>⚠️ 주의:</strong> 이 작업은 되돌릴 수 없습니다. 모든 데이터가 영구적으로 삭제됩니다.
                </p>
              </div>
              <label style={{ fontSize: '14px', fontWeight: '600', color: '#4b5563', display: 'block', marginBottom: '8px' }}>
                계속하려면 "삭제"를 입력하세요
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="삭제"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText('');
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: 'white',
                  color: '#1f2937',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                취소
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== '삭제'}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: deleteConfirmText === '삭제' ? '#dc2626' : '#9ca3af',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: deleteConfirmText === '삭제' ? 'pointer' : 'not-allowed',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                계정 삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}