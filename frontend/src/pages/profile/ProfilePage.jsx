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
        border: '1px solid var(--input-border)',
        fontSize: '14px',
        outline: 'none',
        boxSizing: 'border-box',
        marginBottom: '12px',
        backgroundColor: 'var(--bg-input)',
        color: 'var(--text-primary)'
    };

    const sectionStyle = {
        backgroundColor: 'var(--bg-card)',
        borderRadius: '16px',
        padding: '28px',
        marginBottom: '20px',
        boxShadow: `0 2px 8px var(--shadow)`,
        border: '1px solid var(--border)'
    };

    const labelStyle = {
        fontSize: '12px',
        fontWeight: '600',
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: '4px',
        display: 'block'
    };

    const valueStyle = {
        fontSize: '15px',
        color: 'var(--text-primary)',
        fontWeight: '500'
    };

    const handleProfileSave = async () => {
        setProfileError('');
        setProfileSuccess('');
        if (!profileForm.username) { setProfileError('Username is required.'); return; }
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
            setPasswordError('All fields are required.'); return;
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPasswordError('New passwords do not match.'); return;
        }
        if (passwordForm.newPassword.length < 6) {
            setPasswordError('Password must be at least 6 characters.'); return;
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

    const editBtnStyle = {
        padding: '6px 16px',
        backgroundColor: 'var(--accent-light)',
        color: 'var(--accent-text)',
        border: 'none',
        borderRadius: '6px',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer'
    };

    const saveBtnStyle = {
        padding: '10px 20px',
        backgroundColor: 'var(--accent)',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer'
    };

    const cancelBtnStyle = {
        padding: '10px 20px',
        backgroundColor: 'var(--bg-card)',
        color: 'var(--text-primary)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer'
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
            <Navbar />
            <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 24px' }}>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                    <button
                        onClick={() => navigate('/home')}
                        style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--text-secondary)' }}
                    >
                        ←
                    </button>
                    <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)' }}>
                        My Profile
                    </h1>
                </div>

                {/* Avatar */}
                <div style={{ ...sectionStyle, textAlign: 'center' }}>
                    <div style={{
                        width: '80px', height: '80px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--accent)',
                        color: '#fff',
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '32px', fontWeight: '700',
                        margin: '0 auto 12px'
                    }}>
                        {user?.username?.charAt(0).toUpperCase()}
                    </div>
                    <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)' }}>
                        {user?.username}
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{user?.email}</p>
                </div>

                {/* Profile Details */}
                <div style={sectionStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
                            Profile Details
                        </h3>
                        {!editingProfile && (
                            <button onClick={() => { setEditingProfile(true); setProfileError(''); setProfileSuccess(''); }}
                                style={editBtnStyle}>
                                Edit
                            </button>
                        )}
                    </div>

                    {profileError && (
                        <div style={{ backgroundColor: 'var(--error-light)', color: 'var(--error)', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '14px' }}>
                            {profileError}
                        </div>
                    )}
                    {profileSuccess && (
                        <div style={{ backgroundColor: 'var(--success-light)', color: 'var(--success)', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '14px' }}>
                            {profileSuccess}
                        </div>
                    )}

                    {editingProfile ? (
                        <div>
                            <label style={labelStyle}>Username</label>
                            <input style={inputStyle} type="text" value={profileForm.username}
                                onChange={e => setProfileForm({ ...profileForm, username: e.target.value })}
                                placeholder="Username" />
                            <label style={labelStyle}>Mobile</label>
                            <input style={inputStyle} type="tel" value={profileForm.mobile}
                                onChange={e => setProfileForm({ ...profileForm, mobile: e.target.value })}
                                placeholder="Mobile number" />
                            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                                <button onClick={handleProfileSave} disabled={loading} style={saveBtnStyle}>
                                    {loading ? 'Saving...' : 'Save'}
                                </button>
                                <button onClick={() => { setEditingProfile(false); setProfileForm({ username: user?.username || '', mobile: user?.mobile || '' }); setProfileError(''); }}
                                    style={cancelBtnStyle}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '16px' }}>
                            {[
                                { label: 'Username', value: user?.username },
                                { label: 'Email', value: user?.email },
                                { label: 'Mobile', value: user?.mobile || '—' }
                            ].map(item => (
                                <div key={item.label}>
                                    <span style={labelStyle}>{item.label}</span>
                                    <span style={valueStyle}>{item.value}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Change Password */}
                <div style={sectionStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
                            Change Password
                        </h3>
                        {!editingPassword && (
                            <button onClick={() => { setEditingPassword(true); setPasswordError(''); setPasswordSuccess(''); }}
                                style={editBtnStyle}>
                                Change
                            </button>
                        )}
                    </div>

                    {passwordError && (
                        <div style={{ backgroundColor: 'var(--error-light)', color: 'var(--error)', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '14px' }}>
                            {passwordError}
                        </div>
                    )}
                    {passwordSuccess && (
                        <div style={{ backgroundColor: 'var(--success-light)', color: 'var(--success)', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '14px' }}>
                            {passwordSuccess}
                        </div>
                    )}

                    {editingPassword ? (
                        <div>
                            <label style={labelStyle}>Current Password</label>
                            <input style={inputStyle} type="password" value={passwordForm.currentPassword}
                                onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                placeholder="Enter current password" />
                            <label style={labelStyle}>New Password</label>
                            <input style={inputStyle} type="password" value={passwordForm.newPassword}
                                onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                placeholder="Min 6 characters" />
                            <label style={labelStyle}>Confirm New Password</label>
                            <input style={inputStyle} type="password" value={passwordForm.confirmPassword}
                                onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                placeholder="Re-enter new password" />
                            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                                <button onClick={handlePasswordSave} disabled={loading} style={saveBtnStyle}>
                                    {loading ? 'Saving...' : 'Save'}
                                </button>
                                <button onClick={() => { setEditingPassword(false); setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); setPasswordError(''); }}
                                    style={cancelBtnStyle}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                            Click "Change" to update your password.
                        </p>
                    )}
                </div>

                {/* Logout */}
                <button
                    onClick={() => { logout(); navigate('/login'); }}
                    style={{
                        width: '100%', padding: '14px',
                        backgroundColor: 'var(--error-light)',
                        color: 'var(--error)',
                        border: '1px solid var(--error)',
                        borderRadius: '12px', fontSize: '15px',
                        fontWeight: '700', cursor: 'pointer'
                    }}
                >
                    🚪 Logout
                </button>
            </div>
        </div>
    );
};

export default ProfilePage;