import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ReactDOM from 'react-dom';

const PLANS_API_URL = 'http://localhost:5000/api/plans';

const ProfilePanel = ({ user, isOpen, onClose, onUpdateUser }) => {
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    country: user?.country || ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [showVerifyBox, setShowVerifyBox] = useState(false);
  const [verifyCode, setVerifyCode] = useState('');
  const [verifyMsg, setVerifyMsg] = useState('');
  const [resendMsg, setResendMsg] = useState('');
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [plansError, setPlansError] = useState('');
  const [upgradeMsg, setUpgradeMsg] = useState('');

  // Redirect to login if no token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
    }
  }, []);

  // Fetch profile (including profile_pic) on open
  useEffect(() => {
    if (user && isOpen) {
      const fetchProfile = async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await axios.get(`http://localhost:5000/api/profile/${user.userid}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log('Fetched profile:', res.data); // DEBUG
          setProfile({
            name: res.data.name || '',
            email: res.data.email || '',
            country: res.data.country || ''
          });
          setProfilePic(res.data.profile_pic || '');
          setEmailVerified(!!res.data.email_verified);
        } catch (e) {
          if (e.response && e.response.status === 401) {
            alert('Session expired. Please log in again.');
            localStorage.removeItem('token');
            window.location.href = '/login';
            return;
          }
          setProfilePic('');
        }
      };
      fetchProfile();
    }
  }, [user, isOpen]);

  // Fetch all plans for upgrade options
  useEffect(() => {
    async function fetchPlans() {
      setPlansLoading(true);
      setPlansError('');
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(PLANS_API_URL, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPlans(res.data);
      } catch (e) {
        setPlansError('Failed to load plans');
      }
      setPlansLoading(false);
    }
    if (isOpen) fetchPlans();
  }, [isOpen]);

  // DEBUG: Log profile and profilePic state on every render
  useEffect(() => {
    console.log('Profile state:', profile);
    console.log('ProfilePic state:', profilePic);
  });

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async function (evt) {
        setProfilePic(evt.target.result);
        // Ensure required fields are present
        let name = profile.name, country = profile.country, email = profile.email;
        if (!name || !country || !email) {
          try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:5000/api/profile/${user.userid}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            name = res.data.name || '';
            country = res.data.country || '';
            email = res.data.email || '';
          } catch (err) {
            alert('Failed to fetch profile for auto-save.');
            return;
          }
        }
        if (!name || !country || !email) {
          alert('Please fill in your name, country, and email before uploading a profile picture.');
          return;
        }
        // Auto-save profile picture
        try {
          const token = localStorage.getItem('token');
          await axios.put(`http://localhost:5000/api/profile/${user.userid}`, {
            name,
            country,
            email,
            profile_pic: evt.target.result
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          alert('Profile picture updated successfully!');
        } catch (err) {
          alert('Failed to update profile picture.');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveProfilePic = async () => {
    setProfilePic('');
    // Ensure required fields are present
    let name = profile.name, country = profile.country, email = profile.email;
    if (!name || !country || !email) {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:5000/api/profile/${user.userid}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        name = res.data.name || '';
        country = res.data.country || '';
        email = res.data.email || '';
      } catch (err) {
        alert('Failed to fetch profile for auto-save.');
        return;
      }
    }
    if (!name || !country || !email) {
      alert('Please fill in your name, country, and email before removing your profile picture.');
      return;
    }
    // Auto-save removal
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/profile/${user.userid}`, {
        name,
        country,
        email,
        profile_pic: null
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Profile picture removed.');
    } catch (err) {
      alert('Failed to remove profile picture.');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`http://localhost:5000/api/profile/${user.userid}`, {
        name: profile.name,
        country: profile.country,
        email: profile.email,
        profile_pic: profilePic || null
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.message) {
        onUpdateUser({
          ...user,
          name: profile.name,
          country: profile.country,
          email: profile.email,
          profile_pic: profilePic || null
        });
        setIsEditing(false);
        alert('Profile updated successfully!');
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        alert('Session expired. Please log in again.');
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  // Email verification handler
  const handleVerifyEmail = async () => {
    setVerifyMsg('');
    if (!verifyCode || verifyCode.length !== 4) {
      setVerifyMsg('Enter the 4-digit code sent to your email.');
      return;
    }
    try {
      const res = await axios.post('http://localhost:5000/api/verify-email', {
        userid: user.userid,
        code: verifyCode
      });
      if (res.data.success) {
        setEmailVerified(true);
        setShowVerifyBox(false);
        setVerifyMsg('Email verified successfully!');
      } else {
        setVerifyMsg(res.data.error || 'Verification failed.');
      }
    } catch (err) {
      setVerifyMsg(err.response?.data?.error || 'Verification failed.');
    }
  };

  // Resend code handler
  const handleResendCode = async () => {
    setResendMsg('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/resend-verification-code', {
        userid: user.userid,
        email: profile.email
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setResendMsg('Verification code resent to your email.');
      } else {
        setResendMsg(res.data.error || 'Failed to resend code.');
      }
    } catch (err) {
      setResendMsg(err.response?.data?.error || 'Failed to resend code.');
    }
  };

  // Handle upgrade (placeholder: just show a message)
  const handleUpgrade = async (planName) => {
    setUpgradeMsg('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/user/upgrade-plan', {
        newPlan: planName
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setUpgradeMsg(`Successfully upgraded to ${planName}!`);
        // Refetch user profile to update plan and features
        const profileRes = await axios.get(`http://localhost:5000/api/profile/${user.userid}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (profileRes.data) {
          onUpdateUser({ ...user, plan: profileRes.data.plan, features: profileRes.data.features });
          localStorage.setItem('user', JSON.stringify({ ...user, plan: profileRes.data.plan, features: profileRes.data.features }));
        }
      } else {
        setUpgradeMsg(res.data.error || 'Upgrade failed.');
      }
    } catch (e) {
      setUpgradeMsg('Upgrade failed.');
    }
  };

  // Delete account handler
  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This cannot be undone.')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/users/${user.userid}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      alert('Your account has been deleted.');
      navigate('/');
      window.location.reload();
    } catch (err) {
      alert('Failed to delete account.');
    }
  };

  const modalRoot = document.getElementById('modal-root');
  if (!isOpen || !modalRoot) return null;
  try {
    return ReactDOM.createPortal(
      <>
        {/* Overlay */}
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.25)',
            zIndex: 999,
          }}
          onClick={onClose}
        />
        {/* Profile Panel */}
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            maxWidth: 480,
            height: '100vh',
            background: 'rgba(255,255,255,0.55)',
            backdropFilter: 'blur(8px)',
            boxShadow: '4px 0 32px #bfa16c22',
            zIndex: 1000,
            overflowY: 'auto',
            transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.3s cubic-bezier(.4,2,.6,1)',
            borderTopRightRadius: 32,
            borderBottomRightRadius: 32,
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
            display: 'flex',
            flexDirection: 'column',
            padding: 0,
            fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif'
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{
            background: '#bfa16c',
            color: 'white',
            borderTopRightRadius: 32,
            padding: '32px 32px 16px 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 16px #0001',
            fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif'
          }}>
            <h2 style={{ margin: 0, fontWeight: 900, fontSize: 32, letterSpacing: 1, color: 'white', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}>Profile</h2>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: 32,
                color: 'white',
                cursor: 'pointer',
                fontWeight: 'bold',
                marginLeft: 16
              }}
              title="Close"
            >
              ×
            </button>
          </div>

          {/* Avatar */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: -48,
            marginBottom: 24
          }}>
            <div style={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #bfa16c 60%, #fffbe6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 56,
              color: '#fff',
              fontWeight: 900,
              boxShadow: '0 4px 24px #bfa16c33',
              border: '6px solid #fff',
              overflow: 'hidden',
              position: 'relative',
            }}>
              {profilePic ? (
                <img key={profilePic} src={profilePic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              ) : (
                user?.name?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || 'U'
              )}
            </div>
            <div style={{ marginTop: 12 }}>
              <input
                type="file"
                accept="image/*"
                id="profile-pic-upload"
                style={{ display: 'none' }}
                onChange={handleProfilePicChange}
              />
              <label htmlFor="profile-pic-upload" style={{
                background: '#bfa16c',
                color: 'white',
                padding: '6px 18px',
                borderRadius: 18,
                fontWeight: 'bold',
                cursor: 'pointer',
                marginRight: 8,
                boxShadow: '0 2px 8px #bfa16c33',
                fontSize: 16,
                fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif'
              }}>
                {profilePic ? 'Change Picture' : 'Upload Picture'}
              </label>
              {profilePic && (
                <button onClick={handleRemoveProfilePic} style={{
                  background: '#e53935',
                  color: 'white',
                  border: 'none',
                  borderRadius: 18,
                  padding: '6px 14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: 16,
                  marginLeft: 4
                }}>Remove</button>
              )}
            </div>
            <h3 style={{ margin: '16px 0 0', color: '#bfa16c', fontWeight: 700, fontSize: 24, fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}>{user?.name || user?.username}</h3>
            <p style={{ margin: '4px 0 0', color: '#bfa16c', fontWeight: 500, fontSize: 16, fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}>@{user?.username}</p>
          </div>

          {/* Profile Form */}
          {!isEditing && (
            <div style={{ display: 'flex', gap: 16, marginTop: 8, marginLeft: 32 }}>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                style={{
                  background: '#fff',
                  color: '#bfa16c',
                  fontWeight: 'bold',
                  padding: '12px 24px',
                  borderRadius: 18,
                  fontSize: 16,
                  border: '2px solid #bfa16c',
                  cursor: 'pointer',
                  boxShadow: 'none',
                  transition: 'all 0.3s ease',
                  fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif'
                }}
              >
                Edit Profile
              </button>
            </div>
          )}
          <form style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
            padding: '0 0 32px 32px',
            background: 'none',
            fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif'
          }} onSubmit={e => {
            e.preventDefault();
            if (isEditing) handleSave();
          }} autoComplete="off">
            <div style={{ marginBottom: 8 }}>
              <label style={{
                display: 'block',
                marginBottom: 8,
                fontWeight: 'bold',
                color: '#bfa16c',
                fontSize: 16,
                fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif'
              }}>Username</label>
              <input
                type="text"
                value={user?.username || ''}
                disabled
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #bfa16c',
                  borderRadius: 18,
                  fontSize: 16,
                  background: '#f5faff',
                  color: '#666',
                  fontWeight: 600
                }}
              />
            </div>
            <div style={{ marginBottom: 8 }}>
              <label style={{
                display: 'block',
                marginBottom: 8,
                fontWeight: 'bold',
                color: '#bfa16c',
                fontSize: 16,
                fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif'
              }}>Full Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={e => setProfile(prev => ({ ...prev, name: e.target.value }))}
                disabled={!isEditing}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: isEditing ? '2px solid #bfa16c' : '2px solid #e0e0e0',
                  borderRadius: 18,
                  fontSize: 16,
                  background: isEditing ? '#fff' : '#f5faff',
                  color: isEditing ? '#333' : '#666',
                  fontWeight: 500,
                  transition: 'border-color 0.3s',
                }}
                placeholder="Enter your full name"
              />
            </div>
            <div style={{ marginBottom: 8 }}>
              <label style={{
                display: 'block',
                marginBottom: 8,
                fontWeight: 'bold',
                color: '#bfa16c',
                fontSize: 16,
                fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif'
              }}>Email Address</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <input
                  type="email"
                  value={profile.email}
                  onChange={e => setProfile(prev => ({ ...prev, email: e.target.value }))}
                  disabled={!isEditing}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: isEditing ? '2px solid #bfa16c' : '2px solid #e0e0e0',
                    borderRadius: 18,
                    fontSize: 16,
                    background: isEditing ? '#fff' : '#f5faff',
                    color: isEditing ? '#333' : '#666',
                    fontWeight: 500,
                    transition: 'border-color 0.3s',
                  }}
                  placeholder="Enter your email address"
                />
                {emailVerified ? (
                  <span style={{ color: '#1e7b2a', fontWeight: 'bold', fontSize: 15, background: '#e0ffe0', borderRadius: 8, padding: '4px 10px' }}>Verified</span>
                ) : (
                  <span style={{ color: '#c62828', fontWeight: 'bold', fontSize: 15, background: '#ffe0e0', borderRadius: 8, padding: '4px 10px' }}>Not Verified</span>
                )}
              </div>
              {!emailVerified && !showVerifyBox && (
                <button
                  type="button"
                  onClick={() => setShowVerifyBox(true)}
                  style={{ marginTop: 8, background: '#bfa16c', color: 'white', border: 'none', borderRadius: 12, padding: '6px 18px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}
                >
                  Verify Email
                </button>
              )}
              {!emailVerified && showVerifyBox && (
                <div style={{ marginTop: 10 }}>
                  <input
                    type="text"
                    maxLength={4}
                    value={verifyCode}
                    onChange={e => setVerifyCode(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="Enter 4-digit code"
                    style={{ padding: '8px 16px', borderRadius: 8, border: '1.5px solid #bfa16c', fontSize: 16, width: 120, marginRight: 8 }}
                  />
                  <button
                    type="button"
                    onClick={handleVerifyEmail}
                    style={{ background: '#1e7b2a', color: 'white', border: 'none', borderRadius: 12, padding: '6px 18px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}
                  >
                    Submit Code
                  </button>
                  <button
                    type="button"
                    onClick={handleResendCode}
                    style={{ background: '#bfa16c', color: 'white', border: 'none', borderRadius: 12, padding: '6px 18px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif', marginLeft: 8 }}
                  >
                    Resend Code
                  </button>
                  {verifyMsg && <div style={{ color: verifyMsg.includes('success') ? '#1e7b2a' : '#c62828', marginTop: 6 }}>{verifyMsg}</div>}
                  {resendMsg && <div style={{ color: resendMsg.includes('resent') ? '#1e7b2a' : '#c62828', marginTop: 6 }}>{resendMsg}</div>}
                </div>
              )}
            </div>
            <div style={{ marginBottom: 8 }}>
              <label style={{
                display: 'block',
                marginBottom: 8,
                fontWeight: 'bold',
                color: '#bfa16c',
                fontSize: 16,
                fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif'
              }}>Country</label>
              <input
                type="text"
                value={profile.country}
                onChange={e => setProfile(prev => ({ ...prev, country: e.target.value }))}
                disabled={!isEditing}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: isEditing ? '2px solid #bfa16c' : '2px solid #e0e0e0',
                  borderRadius: 18,
                  fontSize: 16,
                  background: isEditing ? '#fff' : '#f5faff',
                  color: isEditing ? '#333' : '#666',
                  fontWeight: 500,
                  transition: 'border-color 0.3s',
                }}
                placeholder="Enter your country"
              />
            </div>
            {error && (
              <div style={{
                background: '#ffebee',
                color: '#c62828',
                padding: '12px 16px',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 'bold',
                marginBottom: 8,
                border: '1.5px solid #c62828',
                boxShadow: '0 2px 8px #c6282811'
              }}>
                {error}
              </div>
            )}
            {isEditing && (
              <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                <button
                  type="submit"
                  disabled={isSaving}
                  style={{
                    background: isSaving ? '#cccccc' : '#bfa16c',
                    color: 'white',
                    fontWeight: 'bold',
                    padding: '12px 24px',
                    borderRadius: 18,
                    fontSize: 16,
                    border: 'none',
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                    boxShadow: isSaving ? 'none' : '0 2px 8px #bfa16c33',
                    transition: 'all 0.3s ease',
                    opacity: isSaving ? 0.7 : 1,
                    fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif'
                  }}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setProfile({
                      name: user?.name || '',
                      email: user?.email || '',
                      country: user?.country || ''
                    });
                    setProfilePic(''); // Reset profilePic on cancel
                    setError('');
                  }}
                  style={{
                    background: '#fff',
                    color: '#bfa16c',
                    fontWeight: 'bold',
                    padding: '12px 24px',
                    borderRadius: 18,
                    fontSize: 16,
                    border: '2px solid #bfa16c',
                    cursor: 'pointer',
                    boxShadow: 'none',
                    transition: 'all 0.3s ease',
                    fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif'
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
          </form>
          {/* Plans & Upgrade Section */}
          <div style={{ margin: '32px 0 0', padding: '0 32px' }}>
            <h3 style={{ color: '#bfa16c', fontWeight: 700, fontSize: 22, marginBottom: 12, fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}>Your Plan</h3>
            <div style={{ marginBottom: 16, fontWeight: 600, color: '#2a509c', fontSize: 18 }}>
              {user?.plan ? user.plan : 'No plan'}
            </div>
            <h4 style={{ color: '#bfa16c', fontWeight: 700, fontSize: 18, marginBottom: 8, fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}>Available Plans</h4>
            {plansLoading ? <div>Loading plans...</div> : plansError ? <div style={{ color: 'red' }}>{plansError}</div> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {plans.map(plan => (
                  <div key={plan.id} style={{
                    background: user?.plan === plan.name ? 'rgba(123,47,242,0.08)' : 'rgba(255,255,255,0.85)',
                    border: user?.plan === plan.name ? '2.5px solid #7b2ff2' : '2px solid #bfa16c',
                    borderRadius: 16,
                    boxShadow: '0 2px 12px #bfa16c11',
                    padding: 18,
                    marginBottom: 4,
                    fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif',
                    opacity: user?.plan === plan.name ? 1 : 0.95
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ fontWeight: 900, fontSize: 20, color: user?.plan === plan.name ? '#7b2ff2' : '#bfa16c' }}>{plan.name}</div>
                      <div style={{ color: '#bfa16c', fontWeight: 'bold', fontSize: 18 }}>₹{plan.price}</div>
                    </div>
                    <ul style={{ margin: '10px 0 0 18px', color: '#555', fontSize: 15 }}>
                      {plan.features.map(f => (
                        <li key={f.id}><b>{f.feature_label}:</b> {f.feature_key === 'share' || f.feature_key === 'ultra' ? (f.feature_value === 'true' ? 'Enabled' : 'Disabled') : f.feature_value}</li>
                      ))}
                    </ul>
                    {user?.plan === plan.name ? (
                      <div style={{ color: '#1e7b2a', fontWeight: 700, marginTop: 8 }}>Current Plan</div>
                    ) : (
                      <button
                        style={{ background: '#7b2ff2', color: 'white', border: 'none', borderRadius: 18, padding: '8px 22px', fontWeight: 'bold', fontSize: 16, marginTop: 12, fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif', boxShadow: '0 1px 6px #7b2ff233', cursor: 'pointer' }}
                        onClick={() => handleUpgrade(plan.name)}
                      >
                        Upgrade to {plan.name}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
            {upgradeMsg && <div style={{ color: '#2a509c', fontWeight: 600, marginTop: 12 }}>{upgradeMsg}</div>}
          </div>
          {/* Delete Account Button */}
          <div style={{ marginTop: 32, textAlign: 'center' }}>
            <button
              type="button"
              onClick={handleDeleteAccount}
              style={{
                background: '#e53935',
                color: 'white',
                fontWeight: 'bold',
                padding: '12px 28px',
                borderRadius: 18,
                fontSize: 16,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 2px 8px #e5393533',
                fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif',
                marginTop: 8
              }}
            >
              Delete Account
            </button>
          </div>
        </div>
      </>,
      modalRoot
    );
  } catch (err) {
    if (err instanceof DOMException && err.name === 'NotFoundError') {
      console.warn('Portal unmount NotFoundError suppressed:', err);
      return null;
    }
    throw err;
  }
};

export default ProfilePanel; 