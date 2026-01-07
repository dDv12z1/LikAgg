import React, { useState, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/authContext';
import '../css/createShort.css'; 

const CreateShort = () => {
    const { user, api } = useContext(AuthContext);
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [title, setTitle] = useState(''); // [MỚI] State cho title
    const [caption, setCaption] = useState('');
    const [videoFile, setVideoFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        handleSelectedFile(file);
    };

    const handleSelectedFile = (file) => {
        if (file) {
            if (!file.type.startsWith('video/')) {
                setError('Vui lòng chọn file video!');
                return;
            }
            if (file.size > 100 * 1024 * 1024) { 
                setError('Video quá lớn (Tối đa 100MB)!');
                return;
            }
            setVideoFile(file);
            setError('');
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const removeVideo = () => {
        setVideoFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!videoFile) return setError('Bạn chưa chọn video!');
        if (!title.trim()) return setError('Vui lòng nhập tiêu đề!'); // [MỚI] Check title
        if (!user) return setError('Vui lòng đăng nhập!');

        setLoading(true);
        const formData = new FormData();
        // Đảm bảo dùng user.userId hoặc user.id tùy theo AuthContext của bạn (đã fix ở bước trước là user.userId)
        formData.append('userId', user.userId || user.id); 
        formData.append('title', title); // [MỚI] Gửi title
        formData.append('caption', caption);
        formData.append('video', videoFile);

        try {
            await api.post('/api/shorts', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            navigate('/'); 
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Lỗi upload.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-short-container">
            <div className="create-short-header">
                <h2>Đăng tải Short Video</h2>
            </div>

            {error && <div style={{color:'red', textAlign:'center', marginBottom:'15px'}}>{error}</div>}

            <form onSubmit={handleSubmit}>
                {!previewUrl ? (
                    <div className="upload-area-modern" onClick={() => fileInputRef.current.click()}>
                        <input 
                            type="file" 
                            accept="video/mp4,video/mov,video/*" 
                            onChange={handleFileChange} 
                            ref={fileInputRef}
                            style={{display: 'none'}} 
                        />
                        <div className="upload-icon-large">☁️</div>
                        <div className="upload-text-main">Kéo thả video vào đây hoặc click để chọn</div>
                        <div className="upload-text-sub">Hỗ trợ MP4, MOV. Tối đa 100MB. Nên dùng video dọc.</div>
                    </div>
                ) : (
                    <div className="video-preview-container">
                        <video src={previewUrl} controls autoPlay muted loop playsInline />
                        <button type="button" className="remove-video-btn-modern" onClick={removeVideo}>✕</button>
                    </div>
                )}

                {/* [MỚI] Input Title */}
                <input
                    className="caption-input-modern"
                    type="text"
                    placeholder="Tiêu đề video (Bắt buộc)..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={100}
                    style={{fontWeight: 'bold', fontSize: '16px', marginBottom: '15px'}}
                />

                <textarea
                    className="caption-input-modern"
                    placeholder="Mô tả thêm..."
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    maxLength={150}
                    rows={3}
                />

                <div className="action-buttons-modern">
                    <button type="button" className="btn-modern btn-cancel-modern" onClick={() => navigate('/')}>Hủy</button>
                    <button type="submit" className="btn-modern btn-submit-modern" disabled={loading || !videoFile}>
                        {loading ? 'Đang tải lên...' : 'Đăng ngay'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateShort;