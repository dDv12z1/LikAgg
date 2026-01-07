import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/authContext';
// Xóa import GoogleLogin
import '../css/authModal.css';

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
    const [mode, setMode] = useState(initialMode); 
    
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    
    const [error, setError] = useState('');
    const [message, setMessage] = useState(''); 
    const [loading, setLoading] = useState(false);

    // Lấy thêm hàm forgotPassword
    const { login, register, forgotPassword } = useContext(AuthContext);

    useEffect(() => {
        if (isOpen) {
            setMode(initialMode);
            setError('');
            setMessage('');
            setEmail('');
            setUsername('');
            setPassword('');
        }
    }, [isOpen, initialMode]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            if (mode === 'login') {
                const success = await login(email, password);
                if (success) onClose();
                else setError('Email hoặc mật khẩu không đúng.');
            } 
            else if (mode === 'register') {
                const success = await register(username, email, password);
                if (success) onClose(); 
                else setError('Đăng ký thất bại (Email/User đã tồn tại).');
            }
            else if (mode === 'forgot') {
                // --- GỌI API THẬT ---
                await forgotPassword(email);
                setMessage(`Mật khẩu mới đã được gửi đến ${email}. Vui lòng kiểm tra (hoặc xem console server).`);
            }
        } catch (err) {
            // Hiển thị lỗi từ backend (ví dụ: Email không tồn tại)
            setError(err.response?.data?.message || 'Đã xảy ra lỗi.');
        } finally {
            setLoading(false);
        }
    };

    // Hàm render tiêu đề và mô tả dựa trên mode
    const getHeaderContent = () => {
        switch (mode) {
            case 'login': return { title: 'Đăng Nhập', desc: 'Chào mừng trở lại! Hãy đăng nhập để tiếp tục.' };
            case 'register': return { title: 'Đăng Ký', desc: 'Tạo tài khoản để tham gia cộng đồng Likagg.' };
            case 'forgot': return { title: 'Khôi Phục Mật Khẩu', desc: 'Nhập email của bạn để nhận mật khẩu mới.' };
            default: return {};
        }
    };

    const { title, desc } = getHeaderContent();

    return (
        <div className="auth-modal-overlay" onClick={onClose}>
            <div className="auth-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="auth-modal-close" onClick={onClose}>&times;</button>

                <div className="auth-header">
                    <h2 className="auth-title">{title}</h2>
                    <p className="auth-desc">{desc}</p>
                </div>

                {mode !== 'forgot' && (
                    <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', color: '#878a8c', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' }}>
                        <span style={{ flex: 1, height: '1px', backgroundColor: '#edeff1' }}></span>
                        <span style={{ padding: '0 10px' }}>EMAIL</span>
                        <span style={{ flex: 1, height: '1px', backgroundColor: '#edeff1' }}></span>
                    </div>
                )}

                {error && <div style={{color: '#ea0027', fontSize: '13px', marginBottom: '10px', backgroundColor: '#ffe6ea', padding: '8px', borderRadius: '4px'}}>{error}</div>}
                {message && <div style={{color: '#24a0ed', fontSize: '13px', marginBottom: '10px', backgroundColor: '#e1f5fe', padding: '8px', borderRadius: '4px'}}>{message}</div>}

                <form onSubmit={handleSubmit}>
                    {mode === 'register' && (
                        <input type="text" placeholder="Tên người dùng" className="modal-input" value={username} onChange={(e) => setUsername(e.target.value)} required />
                    )}

                    <input type="email" placeholder="Email" className="modal-input" value={email} onChange={(e) => setEmail(e.target.value)} required />

                    {mode !== 'forgot' && (
                        <input type="password" placeholder="Mật khẩu" className="modal-input" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    )}
                    
                    {mode === 'login' && (
                        <div style={{textAlign: 'right', marginBottom: '10px'}}>
                            <span className="switch-link" style={{fontSize: '12px', fontWeight: 'normal', color: '#0079d3'}} onClick={() => { setMode('forgot'); setError(''); setMessage(''); }}>Quên mật khẩu?</span>
                        </div>
                    )}

                    <button type="submit" className="modal-submit-btn" disabled={loading}>
                        {loading ? 'Đang xử lý...' : (mode === 'login' ? 'ĐĂNG NHẬP' : (mode === 'register' ? 'ĐĂNG KÝ' : 'GỬI YÊU CẦU'))}
                    </button>
                </form>

                <div className="switch-mode">
                    {mode === 'login' ? (
                        <>Chưa có tài khoản? <span className="switch-link" onClick={() => { setMode('register'); setError(''); setMessage(''); }}>Đăng ký</span></>
                    ) : mode === 'register' ? (
                        <>Đã có tài khoản? <span className="switch-link" onClick={() => { setMode('login'); setError(''); setMessage(''); }}>Đăng nhập</span></>
                    ) : (
                        <span className="switch-link" onClick={() => { setMode('login'); setError(''); setMessage(''); }}>Quay lại Đăng nhập</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthModal;