import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/authContext';
import { Link } from 'react-router-dom';

// --- COMPONENT CON ĐỆ QUY (RECURSIVE NODE) ---
const CommentNode = ({ comment, postId, onReplySubmit }) => {
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const { user } = useContext(AuthContext);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!replyContent.trim()) return;
        // Gọi hàm của cha để xử lý submit
        onReplySubmit(replyContent, comment.id); 
        setReplyContent('');
        setShowReplyForm(false);
    };

    return (
        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
            {/* Đường kẻ chỉ dẫn cấp độ (Thread line) */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                    width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0,
                    backgroundColor: '#ff4500', color: 'white', display: 'flex', 
                    alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '10px'
                }}>
                    {comment.username ? comment.username.charAt(0).toUpperCase() : 'U'}
                </div>
                {/* Kẻ dọc nếu có con */}
                {comment.children && comment.children.length > 0 && (
                    <div style={{ width: '2px', backgroundColor: '#edeff1', flex: 1, marginTop: '5px' }}></div>
                )}
            </div>
            
            <div style={{ flex: 1 }}>
                {/* Nội dung comment */}
                <div style={{ backgroundColor: '#f6f7f8', padding: '8px 12px', borderRadius: '8px', display: 'inline-block' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '12px', color: '#1c1c1c' }}>{comment.username}</div>
                    <div style={{ fontSize: '14px', color: '#1c1c1c' }}>{comment.content}</div>
                </div>
                
                {/* Actions */}
                <div style={{ fontSize: '12px', color: '#878a8c', marginLeft: '5px', marginTop: '4px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span>{new Date(comment.created_at).toLocaleDateString()}</span>
                    {user && (
                        <button 
                            onClick={() => setShowReplyForm(!showReplyForm)}
                            style={{background: 'none', border: 'none', color: '#878a8c', fontWeight: 'bold', cursor: 'pointer', padding: 0}}
                        >
                            Reply
                        </button>
                    )}
                </div>

                {/* Form Reply */}
                {showReplyForm && (
                    <form onSubmit={handleSubmit} style={{ marginTop: '10px' }}>
                        <textarea
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="Phản hồi..."
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                        <div style={{textAlign: 'right', marginTop: '5px'}}>
                            <button type="submit" style={{ padding: '4px 10px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '15px' }}>Gửi</button>
                        </div>
                    </form>
                )}

                {/* --- ĐỆ QUY: Render con của comment này --- */}
                {comment.children && comment.children.length > 0 && (
                    <div className="comment-children">
                        {comment.children.map(child => (
                            <CommentNode 
                                key={child.id} 
                                comment={child} 
                                postId={postId} 
                                onReplySubmit={onReplySubmit} 
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// --- COMPONENT CHÍNH ---
const CommentSection = ({ postId, initialComments = [] }) => {
    const { user, api } = useContext(AuthContext);
    const [comments, setComments] = useState(initialComments); // Đây là cấu trúc Cây
    const [newComment, setNewComment] = useState('');

    // Cập nhật comments state khi initialComments thay đổi (quan trọng khi load lại trang hoặc mở modal)
    useEffect(() => {
        setComments(initialComments);
    }, [initialComments]);

    // Hàm xử lý gửi comment (Gốc hoặc Reply)
    const handleSubmit = async (content, parentId = null) => {
        try {
            const token = localStorage.getItem('token');
            // Gửi lên server
            const response = await api.post(
                `/api/posts/${postId}/comments`, 
                { content, parent_comment_id: parentId }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            // SAU KHI GỬI THÀNH CÔNG: Tải lại toàn bộ comment để lấy cấu trúc cây mới nhất
            // Đây là cách an toàn nhất để đảm bảo dữ liệu hiển thị đúng với DB
            const refreshRes = await api.get(`/api/posts/${postId}`);
            setComments(refreshRes.data.comments);

        } catch (err) {
            console.error("Lỗi gửi bình luận:", err);
            alert("Lỗi khi gửi bình luận");
        }
    };

    return (
        <div style={{ borderTop: '1px solid #eee', paddingTop: '15px' }}>
            {/* Form nhập Comment Gốc */}
            {user && (
                <div style={{ marginBottom: '20px' }}>
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Viết bình luận của bạn..."
                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                    <button 
                        onClick={() => { handleSubmit(newComment); setNewComment(''); }}
                        disabled={!newComment.trim()}
                        style={{ marginTop: '5px', padding: '6px 12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '20px', fontWeight: 'bold' }}
                    >
                        Bình luận
                    </button>
                </div>
            )}

            {/* Danh sách Comment (Cây) */}
            <div>
                {comments && comments.length > 0 ? (
                    // Logic hiển thị: Nếu backend đã trả về cây, thì các node con đã nằm trong .children
                    // Chúng ta chỉ cần map qua các node gốc (không có parent_comment_id).
                    // Nếu backend trả về phẳng (chưa xử lý cây), chúng ta cần hàm buildTree ở frontend (nhưng tốt nhất là làm ở backend như đã hướng dẫn).
                    // Ở đây giả định backend ĐÃ trả về cây (như code postRoutes.js trước đó).
                    comments
                        .filter(comment => !comment.parent_comment_id) // Chỉ render comment cấp 1
                        .map(comment => (
                            <CommentNode 
                                key={comment.id} 
                                comment={comment} 
                                postId={postId} 
                                onReplySubmit={handleSubmit} 
                            />
                        ))
                ) : (
                    <p style={{ color: '#777', fontStyle: 'italic' }}>Chưa có bình luận nào.</p>
                )}
            </div>
        </div>
    );
};

export default CommentSection;