import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/authContext';
import '../css/createPost.css'; // Tái sử dụng CSS của CreatePost cho đẹp

const CreateCommunity = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { api } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!name.trim()) {
            setError('Tên cộng đồng là bắt buộc');
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Vui lòng đăng nhập.');

            // Gọi API tạo cộng đồng
            await api.post('/api/communities', 
                { name, description }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Thành công -> Chuyển hướng đến trang cộng đồng vừa tạo
            navigate(`/r/${name}`);

        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Lỗi tạo cộng đồng');
            setLoading(false);
        }
    };

    return (
        <div className="create-post-container">
            <h2 className="cp-header">Tạo Cộng Đồng Mới</h2>
            
            {error && <div className="cp-error">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="cp-input-group">
                    <label className="cp-label">Tên cộng đồng (r/)</label>
                    <div style={{display: 'flex', alignItems: 'center'}}>
                        <span style={{padding: '10px', backgroundColor: '#eee', border: '1px solid #ccc', borderRight: 'none', borderRadius: '5px 0 0 5px', color: '#555'}}>r/</span>
                        <input
                            type="text"
                            className="cp-input"
                            style={{borderRadius: '0 5px 5px 0'}}
                            placeholder="vd: congnghe, memevn"
                            value={name}
                            onChange={(e) => setName(e.target.value.toLowerCase().replace(/\s/g, ''))} // Tự động lowercase và bỏ dấu cách
                            maxLength={20}
                        />
                    </div>
                    <small style={{color: '#777'}}>Chỉ bao gồm chữ thường, số và gạch dưới. Không có khoảng trắng.</small>
                </div>

                <div className="cp-input-group">
                    <label className="cp-label">Mô tả (Tùy chọn)</label>
                    <textarea
                        className="cp-textarea"
                        placeholder="Cộng đồng này nói về cái gì?"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        style={{minHeight: '80px'}}
                    />
                </div>

                <button type="submit" className="cp-submit-btn" disabled={loading}>
                    {loading ? 'Đang tạo...' : 'Tạo Cộng Đồng'}
                </button>
            </form>
        </div>
    );
};

export default CreateCommunity;