import React from 'react';
import { Link } from 'react-router-dom';

const UserListModal = ({ title, users, onClose }) => {
    // Ngăn sự kiện click lan ra ngoài để không đóng modal nhầm
    const handleContentClick = (e) => e.stopPropagation();

    // --- HÀM XỬ LÝ URL AVATAR (Giống bên UserProfile) ---
    const getAvatarUrl = (avatar) => {
        const BACKEND_URL = 'http://localhost:5001';
        
        // 1. Nếu không có avatar -> Dùng ảnh mặc định new.png trên server
        if (!avatar) return `${BACKEND_URL}/uploads/new.png`;
        
        // 2. Nếu là link tuyệt đối (Google/Facebook...) -> Giữ nguyên
        if (avatar.startsWith('http')) return avatar;
        
        // 3. Nếu là tên file -> Thêm tiền tố backend
        return `${BACKEND_URL}/uploads/${avatar}`;
    };

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={handleContentClick}>
                <div style={styles.header}>
                    <h3 style={styles.title}>{title}</h3>
                    <button style={styles.closeBtn} onClick={onClose}>✕</button>
                </div>
                
                <div style={styles.body}>
                    {users.length === 0 ? (
                        <p style={{textAlign: 'center', color: '#666', marginTop: '20px'}}>Danh sách trống.</p>
                    ) : (
                        users.map(user => (
                            <Link 
                                key={user.id} 
                                to={`/u/${user.username}`} 
                                style={styles.userItem}
                                onClick={onClose} // Đóng modal khi click vào user
                            >
                                <img 
                                    src={getAvatarUrl(user.avatar)} 
                                    alt={user.username} 
                                    style={styles.avatar}
                                    // Fallback nếu ảnh lỗi
                                    onError={(e) => {
                                        e.target.onerror = null; 
                                        e.target.src = "http://localhost:5001/uploads/new.png";
                                    }}
                                />
                                <span style={styles.username}>{user.username}</span>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

// --- STYLES (Inline để tránh vỡ layout) ---
const styles = {
    overlay: {
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.6)', zIndex: 9999,
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        backdropFilter: 'blur(3px)'
    },
    modal: {
        backgroundColor: 'white', width: '90%', maxWidth: '400px',
        maxHeight: '80vh', borderRadius: '12px', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', 
        boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
        animation: 'fadeIn 0.2s ease-out'
    },
    header: {
        padding: '15px 20px', borderBottom: '1px solid #eee',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        backgroundColor: '#fff'
    },
    title: { margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#1a1a1b' },
    closeBtn: { border: 'none', background: 'transparent', fontSize: '24px', cursor: 'pointer', color: '#878a8c' },
    body: { padding: '0', overflowY: 'auto', backgroundColor: '#fff' },
    userItem: {
        display: 'flex', alignItems: 'center', padding: '12px 20px',
        textDecoration: 'none', color: '#1a1a1b', borderBottom: '1px solid #f5f5f5',
        transition: 'background 0.2s'
    },
    avatar: { 
        width: '40px', height: '40px', borderRadius: '50%', 
        marginRight: '15px', objectFit: 'cover', 
        border: '1px solid #eee', backgroundColor: '#f0f2f5' 
    },
    username: { fontWeight: '600', fontSize: '15px' }
};

export default UserListModal;