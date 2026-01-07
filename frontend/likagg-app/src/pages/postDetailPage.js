import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../context/authContext.js';

const PostDetailPage = () => {
    const { id } = useParams(); // <-- Lấy 'id' từ URL (ví dụ: /post/1 -> id = 1)
    const { api } = useContext(AuthContext);
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                setLoading(true);
                // Gọi API backend với 'id' lấy từ URL
                const response = await api.get(`/api/posts/${id}`);
                setPost(response.data);
                setLoading(false);
            } catch (err) {
                setError('Không thể tìm thấy bài đăng');
                setLoading(false);
                console.error(err);
            }
        };

        fetchPost();
    }, [api, id]); // Phụ thuộc vào 'id' (nếu chuyển trang)

    if (loading) return <p>Đang tải bài đăng...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;
    if (!post) return null; // Trường hợp không có bài đăng

    return (
        <div>
            <h2>{post.title}</h2>
            <p style={{ fontSize: '0.9rem', color: '#777' }}>
                Đăng bởi {post.username} lúc {new Date(post.created_at).toLocaleString()}
            </p>

            {/* Hiển thị nội dung tùy loại bài đăng */}
            {post.url && (
                <p>
                    <a href={post.url} target="_blank" rel="noopener noreferrer">
                        {post.url}
                    </a>
                </p>
            )}

            {post.text_content && (
                <div style={{ marginTop: '20px', lineHeight: '1.6' }}>
                    {/* Dùng pre-wrap để giữ định dạng xuống dòng */}
                    <p style={{ whiteSpace: 'pre-wrap' }}>{post.text_content}</p>
                </div>
            )}

            <hr style={{ margin: '20px 0' }} />

            {/* (PHẦN NÀY DÀNH CHO BƯỚC 2.3) */}
            <h3>Bình luận</h3>
            <p>Phần bình luận sẽ được thêm ở bước tiếp theo...</p>
        </div>
    );
};

export default PostDetailPage;