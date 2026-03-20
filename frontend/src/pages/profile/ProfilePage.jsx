import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import useAuth from '../../hooks/useAuth';
import Navbar from '../../components/Navbar';

const ProfilePage = () => {
    const navigate = useNavigate();
    const { user, updateUser, logout } = useAuth();

    const [editingProfile, setEditingProfile] = useState(false);
    const [editingPassword, setEditingPassword] = useState(false);

    const [profileForm, setProfileForm] = useState({
        username: user?.username || '',
        mobile: user?.mobile || ''
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [profileError, setProfileError] = useState('');
    const [profileSuccess, setProfileSuccess] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const inputStyle = {
        width: '100%',
        padding: '10px 14px',
        borderRadius: '8px',
        border: '1px solid #ddd',
        fontSize: '14px',
        outline: 'none',
        boxSizing: 'border-box',
        marginBottom: '12px'
    };

    const handleProfileSave = async () => {
        setProfileError('');
        setProfileSuccess('');
        if (!profileForm.username) {
            setProfileError('Username is required.');
            return;
        }
        setLoading(true);
        try {
            const res = await API.put('/profile/update', profileForm);
            updateUser(res.data.user);
            setProfileSuccess('Profile updated successfully!');
            setEditingProfile(false);
        } catch (err) {
            setProfileError(err.response?.data?.message || 'Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSave = async () => {
        setPasswordError('');
        setPasswordSuccess('');
        if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
            setPasswordError('All fields are required.');
            return;
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPasswordError('New passwords do not match.');
            return;
        }
        if (passwordForm.newPassword.length < 6) {
            setPasswordError('Password must be at least 6 characters.');
            return;
        }
        setLoading(true);
        try {
            await API.put('/profile/update-password', passwordForm);
            setPasswordSuccess('Password updated successfully!');
            setEditingPassword(false);
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            setPasswordError(err.response?.data?.message || 'Failed to update password.');
        } finally {
            setLoading(false);
        }
    };

    const sectionStyle = {
        backgroundColor: '#fff',
        borderRadius: '16px',
        padding: '28px',
        marginBottom: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
    };

    const labelStyle = {
        fontSize: '12px',
        fontWeight: '600',
        color: '#888',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: '4px',
        display: 'block'
    };

    const valueStyle = {
        fontSize: '15px',
        color: '#111',
        fontWeight: '500'
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
            <Navbar />
            <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                    <button
                        onClick={() => navigate('/home')}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '20px',
                            cursor: 'pointer',
                            color: '#666'
                        }}
                    >
                        ←
                    </button>
                    <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#111' }}>
                        My Profile
                    </h1>
                </div>

                {/* Avatar */}
                <div style={{ ...sectionStyle, textAlign: 'center' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        backgroundColor: '#4F46E5',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '32px',
                        fontWeight: '700',
                        margin: '0 auto 12px'
                    }}>
                        {user?.username?.charAt(0).toUpperCase()}
                    </div>
                    <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111' }}>
                        {user?.username}
                    </h2>
                    <p style={{ color: '#888', fontSize: '14px' }}>{user?.email}</p>
                </div>

                {/* Profile Details */}
                <div style={sectionStyle}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '20px'
                    }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111' }}>
                            Profile Details
                        </h3>
                        {!editingProfile && (
                            <button
                                onClick={() => {
                                    setEditingProfile(true);
                                    setProfileError('');
                                    setProfileSuccess('');
                                }}
                                style={{
                                    padding: '6px 16px',
                                    backgroundColor: '#EEF2FF',
                                    color: '#4F46E5',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                Edit
                            </button>
                        )}
                    </div>

                    {profileError && (
                        <div style={{
                            backgroundColor: '#FEF2F2',
                            color: '#EF4444',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            fontSize: '13px',
                            marginBottom: '14px'
                        }}>
                            {profileError}
                        </div>
                    )}

                    {profileSuccess && (
                        <div style={{
                            backgroundColor: '#F0FDF4',
                            color: '#10B981',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            fontSize: '13px',
                            marginBottom: '14px'
                        }}>
                            {profileSuccess}
                        </div>
                    )}

                    {editingProfile ? (
                        <div>
                            <label style={labelStyle}>Username</label>
                            <input
                                style={inputStyle}
                                type="text"
                                value={profileForm.username}
                                onChange={e => setProfileForm({ ...profileForm, username: e.target.value })}
                                placeholder="Username"
                            />
                            <label style={labelStyle}>Mobile</label>
                            <input
                                style={inputStyle}
                                type="tel"
                                value={profileForm.mobile}
                                onChange={e => setProfileForm({ ...profileForm, mobile: e.target.value })}
                                placeholder="Mobile number"
                            />
                            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                                <button
                                    onClick={handleProfileSave}
                                    disabled={loading}
                                    style={{
                                        padding: '10px 20px',
                                        backgroundColor: '#4F46E5',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {loading ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                    onClick={() => {
                                        setEditingProfile(false);
                                        setProfileForm({ username: user?.username || '', mobile: user?.mobile || '' });
                                        setProfileError('');
                                    }}
                                    style={{
                                        padding: '10px 20px',
                                        backgroundColor: '#fff',
                                        color: '#333',
                                        border: '1px solid #ddd',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '16px' }}>
                            <div>
                                <span style={labelStyle}>Username</span>
                                <span style={valueStyle}>{user?.username}</span>
                            </div>
                            <div>
                                <span style={labelStyle}>Email</span>
                                <span style={valueStyle}>{user?.email}</span>
                            </div>
                            <div>
                                <span style={labelStyle}>Mobile</span>
                                <span style={valueStyle}>{user?.mobile || '—'}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Change Password */}
                <div style={sectionStyle}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '20px'
                    }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111' }}>
                            Change Password
                        </h3>
                        {!editingPassword && (
                            <button
                                onClick={() => {
                                    setEditingPassword(true);
                                    setPasswordError('');
                                    setPasswordSuccess('');
                                }}
                                style={{
                                    padding: '6px 16px',
                                    backgroundColor: '#EEF2FF',
                                    color: '#4F46E5',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                Change
                            </button>
                        )}
                    </div>

                    {passwordError && (
                        <div style={{
                            backgroundColor: '#FEF2F2',
                            color: '#EF4444',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            fontSize: '13px',
                            marginBottom: '14px'
                        }}>
                            {passwordError}
                        </div>
                    )}

                    {passwordSuccess && (
                        <div style={{
                            backgroundColor: '#F0FDF4',
                            color: '#10B981',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            fontSize: '13px',
                            marginBottom: '14px'
                        }}>
                            {passwordSuccess}
                        </div>
                    )}

                    {editingPassword ? (
                        <div>
                            <label style={labelStyle}>Current Password</label>
                            <input
                                style={inputStyle}
                                type="password"
                                value={passwordForm.currentPassword}
                                onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                placeholder="Enter current password"
                            />
                            <label style={labelStyle}>New Password</label>
                            <input
                                style={inputStyle}
                                type="password"
                                value={passwordForm.newPassword}
                                onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                placeholder="Min 6 characters"
                            />
                            <label style={labelStyle}>Confirm New Password</label>
                            <input
                                style={inputStyle}
                                type="password"
                                value={passwordForm.confirmPassword}
                                onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                placeholder="Re-enter new password"
                            />
                            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                                <button
                                    onClick={handlePasswordSave}
                                    disabled={loading}
                                    style={{
                                        padding: '10px 20px',
                                        backgroundColor: '#4F46E5',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {loading ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                    onClick={() => {
                                        setEditingPassword(false);
                                        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                                        setPasswordError('');
                                    }}
                                    style={{
                                        padding: '10px 20px',
                                        backgroundColor: '#fff',
                                        color: '#333',
                                        border: '1px solid #ddd',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p style={{ fontSize: '14px', color: '#888' }}>
                            Click "Change" to update your password.
                        </p>
                    )}
                </div>

                {/* Logout */}
                <button
                    onClick={() => { logout(); navigate('/login'); }}
                    style={{
                        width: '100%',
                        padding: '14px',
                        backgroundColor: '#FEF2F2',
                        color: '#EF4444',
                        border: '1px solid #FECACA',
                        borderRadius: '12px',
                        fontSize: '15px',
                        fontWeight: '700',
                        cursor: 'pointer'
                    }}
                >
                    🚪 Logout
                </button>
            </div>
        </div>
    );
};

export default ProfilePage;