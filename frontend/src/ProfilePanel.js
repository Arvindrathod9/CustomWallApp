import React, { useState, useEffect } from 'react';
import axios from 'axios';

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

  if (!isOpen) return null;

  return (
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
        <form style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
          padding: '0 0 32px 32px',
          background: 'none',
          fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif'
        }} onSubmit={e => { e.preventDefault(); handleSave(); }}>
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
          <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
            {isEditing ? (
              <>
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
              </>
            ) : (
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
            )}
          </div>
        </form>
      </div>
    </>
  );
};

export default ProfilePanel; 