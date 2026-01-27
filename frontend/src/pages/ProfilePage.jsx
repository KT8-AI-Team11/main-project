import React, { useState } from 'react';
import { User, Mail, Building, Phone, Bell, Lock, Trash2, Save, Edit2, X } from 'lucide-react';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    username: 'coach-demo',
    email: 'coach-demo@example.com',
    company: '',
    phone: '',
    department: '',
    position: ''
  });

  const [tempData, setTempData] = useState({ ...profileData });
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true
  });
  const [tempNotifications, setTempNotifications] = useState({ ...notifications });

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
    </div>
  );
}