import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/authContext';
import PostItem from './postItem'; // Tái sử dụng PostItem để hiển thị nội dung
import CommentSection from './commentSection.js'; // Chúng ta sẽ tách phần bình luận ra riêng
import '../css/postDetailModal.css';

const PostDetailModal = ({ postId, onClose }) => {
    const { api } = useContext(AuthContext);
    const [postData, setPostData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPostDetail = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/api/posts/${postId}`);
                setPostData(response.data); // Gồm { post, comments }
                setLoading(false);
            } catch (error) {
                console.error("Lỗi tải chi tiết bài đăng:", error);
                setLoading(false);
            }
        };

        if (postId) fetchPostDetail();
        
        // Khóa cuộn trang chính khi mở modal
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [api, postId]);

    if (!postId) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>&times;</button>
                
                <div className="modal-body-scroll">
                    {loading ? (
                        <p style={{textAlign: 'center', marginTop: '20px'}}>Đang tải...</p>
                    ) : postData ? (
                        <>
                            {/* Hiển thị bài đăng (Tái sử dụng PostItem nhưng tắt các link popup) */}
                            <PostItem 
                                post={postData.post} 
                                isModalView={true} // Prop mới để báo cho PostItem biết nó đang ở trong Modal
                            />
                            
                            {/* Phần bình luận */}
                            <div style={{ marginTop: '20px', padding: '0 10px' }}>
                                <CommentSection 
                                    postId={postId} 
                                    initialComments={postData.comments} 
                                />
                            </div>
                        </>
                    ) : (
                        <p>Không tìm thấy nội dung.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PostDetailModal;