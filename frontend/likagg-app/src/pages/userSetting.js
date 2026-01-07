import React, { useState, useContext, useEffect, useRef } from 'react';
import { AuthContext } from '../context/authContext';
import '../css/userSetting.css';

const UserSettings = () => {
    const { user, api } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('profile'); // 'profile' hoặc 'account'
    
    // State cho Profile
    const [bio, setBio] = useState('');
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    
    // State cho Password
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const fileInputRef = useRef(null);

    // Load thông tin hiện tại khi vào trang
    useEffect(() => {
        const fetchUserData = async () => {
            if (!user) return;
            try {
                const res = await api.get(`/api/users/${user.username}`);
                setBio(res.data.user.bio || '');
                if (res.data.user.avatar_url) {
                    setAvatarPreview(res.data.user.avatar_url);
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchUserData();
    }, [user, api]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleSaveProfile = async () => {
        setLoading(true);
        setMessage({ type: '', text: '' });

        const formData = new FormData();
        formData.append('bio', bio);
        if (avatarFile) {
            formData.append('avatar', avatarFile);
        }

        try {
            const token = localStorage.getItem('token');
            await api.put('/api/users/me', formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setMessage({ type: 'success', text: 'Cập nhật Profile thành công!' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Lỗi cập nhật Profile.' });
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async () => {
        setLoading(true);
        setMessage({ type: '', text: '' });

        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'Mật khẩu mới không khớp.' });
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await api.put('/api/users/me', { password, newPassword }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage({ type: 'success', text: 'Đổi mật khẩu thành công!' });
            setPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Lỗi đổi mật khẩu.' });
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <div style={{textAlign:'center', marginTop:50}}>Vui lòng đăng nhập.</div>;

    return (
        <div className="settings-container">
            {/* Sidebar Menu */}
            <div className="settings-sidebar">
                <div 
                    className={`settings-menu-item ${activeTab === 'profile' ? 'active' : ''}`}
                    onClick={() => { setActiveTab('profile'); setMessage({ type: '', text: '' }); }}
                >
                    Hồ sơ (Profile)
                </div>
                <div 
                    className={`settings-menu-item ${activeTab === 'account' ? 'active' : ''}`}
                    onClick={() => { setActiveTab('account'); setMessage({ type: '', text: '' }); }}
                >
                    Tài khoản (Account)
                </div>
            </div>

            {/* Content Area */}
            <div className="settings-content">
                {message.text && (
                    <div className={message.type === 'success' ? 'success-msg' : 'error-msg'}>
                        {message.text}
                    </div>
                )}

                {/* TAB PROFILE */}
                {activeTab === 'profile' && (
                    <>
                        <h2 className="settings-title">Tùy chỉnh Hồ sơ</h2>
                        <p className="settings-desc">Thay đổi thông tin hiển thị với mọi người.</p>

                        <div className="setting-section">
                            <label className="setting-label">Ảnh đại diện</label>
                            <div style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
                                <img 
                                    src={avatarPreview || `https://ui-avatars.com/api/?name=${user.username}&background=random`} 
                                    alt="Avatar" 
                                    className="avatar-preview" 
                                />
                                <div className="file-input-wrapper">
                                    <button className="btn-upload" onClick={() => fileInputRef.current.click()}>
                                        Tải ảnh lên
                                    </button>
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        onChange={handleFileChange} 
                                        accept="image/*" 
                                        style={{display: 'none'}} 
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="setting-section">
                            <label className="setting-label">Giới thiệu (Bio)</label>
                            <textarea 
                                className="setting-textarea" 
                                placeholder="Mô tả ngắn về bạn..."
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                maxLength={200}
                            />
                            <p className="setting-note">{bio.length}/200 ký tự</p>
                        </div>

                        <button className="btn-save" onClick={handleSaveProfile} disabled={loading}>
                            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                    </>
                )}

                {/* TAB ACCOUNT */}
                {activeTab === 'account' && (
                    <>
                        <h2 className="settings-title">Bảo mật tài khoản</h2>
                        <p className="settings-desc">Quản lý mật khẩu và đăng nhập.</p>

                        <div className="setting-section">
                            <label className="setting-label">Mật khẩu hiện tại</label>
                            <input 
                                type="password" 
                                className="setting-input" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <div className="setting-section">
                            <label className="setting-label">Mật khẩu mới</label>
                            <input 
                                type="password" 
                                className="setting-input" 
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </div>

                        <div className="setting-section">
                            <label className="setting-label">Xác nhận mật khẩu mới</label>
                            <input 
                                type="password" 
                                className="setting-input" 
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>

                        <button className="btn-save" onClick={handleChangePassword} disabled={loading}>
                            {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default UserSettings;