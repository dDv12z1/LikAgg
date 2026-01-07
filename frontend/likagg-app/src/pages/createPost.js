import React, { useState, useContext, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/authContext';
import '../css/createPost.css';

const CreatePost = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [link, setLink] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [showLinkInput, setShowLinkInput] = useState(false);
    
    const [communities, setCommunities] = useState([]); 
    const [selectedCommunity, setSelectedCommunity] = useState(''); 

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { api } = useContext(AuthContext);
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    // --- LẤY DANH SÁCH CỘNG ĐỒNG ---
    useEffect(() => {
        const fetchCommunities = async () => {
            try {
                const response = await api.get('/api/communities');
                setCommunities(response.data);
                if (response.data.length > 0) {
                    // Mặc định chọn cộng đồng đầu tiên
                    setSelectedCommunity(response.data[0].name); 
                }
            } catch (err) {
                console.error("Lỗi lấy danh sách cộng đồng:", err);
            }
        };
        fetchCommunities();
    }, [api]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!title.trim()) {
            setError('Tiêu đề là bắt buộc!');
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        
        // Backend mong đợi dạng 'r/tencongdong'
        formData.append('community', `r/${selectedCommunity}`); 

        let finalContent = content;
        if (imageFile && link) {
            finalContent += `\n\nLink tham khảo: ${link}`;
        } else {
            if (link) formData.append('url', link);
        }

        formData.append('text_content', finalContent);

        if (imageFile) {
            formData.append('image', imageFile);
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Vui lòng đăng nhập lại.');

            await api.post('/api/posts', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            // --- SỬA ĐỔI LOGIC CHUYỂN HƯỚNG TẠI ĐÂY ---
            // Thay vì navigate tới `/post/${response.data.id}` (Trang chi tiết)
            // Ta chuyển về trang cộng đồng tương ứng hoặc trang chủ
            
            if (selectedCommunity && selectedCommunity !== 'general') {
                navigate(`/r/${selectedCommunity}`); // Về trang cộng đồng (ví dụ: /r/congnghe)
            } else {
                navigate('/'); // Về trang chủ
            }
            // -------------------------------------------

        } catch (err) {
            console.error('Lỗi tạo bài đăng:', err);
            setError(err.response?.data?.message || 'Lỗi không xác định');
            setLoading(false);
        }
    };

    return (
        <div className="create-post-container">
            <h2 className="cp-header">Tạo bài viết mới</h2>

            {error && <div className="cp-error">{error}</div>}

            <form onSubmit={handleSubmit}>
                
                {/* Ô CHỌN CỘNG ĐỒNG */}
                <div className="cp-input-group">
                    <label className="cp-label">Chọn cộng đồng:</label>
                    <select 
                        className="cp-input"
                        value={selectedCommunity}
                        onChange={(e) => setSelectedCommunity(e.target.value)}
                        style={{cursor: 'pointer', fontWeight: 'bold'}}
                    >
                        {communities.length > 0 ? (
                            communities.map(c => (
                                <option key={c.id} value={c.name}>r/{c.name}</option>
                            ))
                        ) : (
                            <option value="">Đang tải danh sách...</option>
                        )}
                    </select>
                </div>

                {/* 1. TIÊU ĐỀ */}
                <div className="cp-input-group">
                    <input
                        type="text"
                        className="cp-input"
                        placeholder="Tiêu đề (Bắt buộc)"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        autoFocus
                    />
                </div>

                {/* 2. NỘI DUNG */}
                <div className="cp-input-group">
                    <textarea
                        className="cp-textarea"
                        placeholder="Bạn đang nghĩ gì? Hãy chia sẻ câu chuyện của bạn..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />
                </div>

                {/* 3. CÔNG CỤ ĐÍNH KÈM */}
                <div className="cp-attachments">
                    <div 
                        className={`cp-attach-btn ${imageFile ? 'active' : ''}`}
                        onClick={() => fileInputRef.current.click()}
                    >
                        <span>📷</span> Thêm Ảnh
                    </div>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept="image/*" 
                        style={{display: 'none'}} 
                    />

                    <div 
                        className={`cp-attach-btn ${showLinkInput ? 'active' : ''}`}
                        onClick={() => setShowLinkInput(!showLinkInput)}
                    >
                        <span>🔗</span> Thêm Link
                    </div>
                </div>

                {showLinkInput && (
                    <div className="cp-input-group fade-in">
                        <input
                            type="url"
                            className="cp-input"
                            placeholder="Dán đường link (URL) vào đây..."
                            value={link}
                            onChange={(e) => setLink(e.target.value)}
                        />
                    </div>
                )}

                {previewUrl && (
                    <div className="image-preview-area">
                        <img src={previewUrl} alt="Preview" className="preview-img" />
                        <button type="button" className="remove-img-btn" onClick={handleRemoveImage}>
                            ✕
                        </button>
                    </div>
                )}

                <div style={{ marginTop: '30px' }}>
                    <button type="submit" className="cp-submit-btn" disabled={loading}>
                        {loading ? 'Đang đăng tải...' : 'ĐĂNG BÀI VIẾT'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreatePost;