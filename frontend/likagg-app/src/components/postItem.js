import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/authContext';
import CommentSection from './commentSection'; // Import component bình luận
import { Link } from 'react-router-dom'; 
import '../css/postItem.css';

const PostItem = ({ post, onPostClick, isModalView = false, hideFollowBtn = false }) => {
    const { api, user } = useContext(AuthContext);
    
    // State cho Vote
    const [score, setScore] = useState(parseInt(post.score) || 0);
    const [voteStatus, setVoteStatus] = useState(0); 

    // State cho Follow
    const [isFollowing, setIsFollowing] = useState(false);
    
    // State cho Comment Inline
    const [showInlineComments, setShowInlineComments] = useState(false);
    const [commentsLoaded, setCommentsLoaded] = useState([]);

    const isImageUrl = (url) => { if (!url) return false; return url.match(/\.(jpeg|jpg|gif|png)$/) != null; };
    const getAvatarLetter = (name) => name ? name.charAt(0).toUpperCase() : 'U';
    const formatTime = (dateString) => { const date = new Date(dateString); return date.toLocaleDateString('vi-VN'); };
    const isImage = isImageUrl(post.url);

    // --- KIỂM TRA TRẠNG THÁI FOLLOW (Khi load bài) ---
    useEffect(() => {
        const checkFollowStatus = async () => {
            // Chỉ kiểm tra nếu:
            // 1. Đã đăng nhập (user tồn tại)
            // 2. Bài viết có người đăng (post.username tồn tại)
            // 3. Người đăng KHÔNG PHẢI là mình
            if (user && post.username && user.username !== post.username) {
                try {
                    const response = await api.get(`/api/users/${post.username}/is-following`);
                    setIsFollowing(response.data.isFollowing);
                } catch (err) {
                    console.error("Lỗi check follow:", err);
                }
            }
        };
        checkFollowStatus();
    }, [user, post.username, api]);


    // --- XỬ LÝ FOLLOW ---
    const handleFollow = async (e) => {
        e.preventDefault(); // Chặn link
        e.stopPropagation(); // Chặn mở modal

        if (!user) {
            alert("Vui lòng đăng nhập để theo dõi!");
            return;
        }
        if (user.username === post.username) {
            alert("Bạn không thể tự theo dõi chính mình!");
            return;
        }

        // Optimistic UI: Cập nhật giao diện trước
        const newStatus = !isFollowing;
        setIsFollowing(newStatus);

        try {
            await api.post(`/api/users/${post.username}/follow`);
            // Thành công thì không cần làm gì thêm
        } catch (err) {
            console.error("Lỗi follow:", err);
            setIsFollowing(!newStatus); // Revert nếu lỗi
            alert("Lỗi khi thực hiện theo dõi.");
        }
    };

    // --- CÁC HÀM XỬ LÝ KHÁC (GIỮ NGUYÊN) ---
    const handleUserClick = (e) => { e.stopPropagation(); };

    const handleVote = async (direction) => {
        if (!user) { alert("Vui lòng đăng nhập để vote!"); return; }
        let newScore = score;
        let newStatus = direction;
        if (voteStatus === direction) { newStatus = 0; newScore = score - direction; } 
        else { newScore = score - voteStatus + direction; }
        setVoteStatus(newStatus); setScore(newScore);
        try {
            const token = localStorage.getItem('token');
            await api.post(`/api/posts/${post.id}/vote`, { direction: newStatus }, { headers: { Authorization: `Bearer ${token}` } });
        } catch (error) { console.error("Lỗi vote:", error); }
    };

    const handleCommentClick = async () => {
        if (isModalView) return; 
        if (!showInlineComments) {
            setShowInlineComments(true);
            try {
                const response = await api.get(`/api/posts/${post.id}`);
                setCommentsLoaded(response.data.comments);
            } catch (err) { console.error("Lỗi tải bình luận inline:", err); }
        } else { setShowInlineComments(false); }
    };

    const handleContentClick = (e) => {
        if (isModalView) return; 
        e.preventDefault(); 
        if (onPostClick) onPostClick(post.id); 
    };

    const handleImageClick = (e) => {
        e.stopPropagation(); 
        window.open(post.url, '_blank');
    };

    // Logic kiểm tra xem có nên hiện nút Follow không
    // Điều kiện: Đã đăng nhập VÀ Không phải bài của mình VÀ Không bị ẩn bởi prop cha
    const shouldShowFollowBtn = user && post.username && user.username !== post.username && !hideFollowBtn;

    return (
        <div className="post-card">
            
            {/* 1. HEADER */}
            <div className="post-header">
                <Link 
                    to={`/u/${post.username}`} 
                    className="post-avatar" 
                    onClick={handleUserClick}
                    style={{textDecoration: 'none'}}
                >
                    {getAvatarLetter(post.username)}
                </Link>
                
                <div className="post-info">
                    <span className="post-author">
                        <Link 
                            to={`/u/${post.username}`} 
                            style={{color: 'inherit', textDecoration: 'none'}}
                            onClick={handleUserClick}
                            className="hover-underline"
                        >
                            u/{post.username}
                        </Link>
                    </span>
                    
                    <span className="post-time">• {formatTime(post.created_at)}</span>
                    
                    {/* --- NÚT FOLLOW (LOGIC CẬP NHẬT) --- */}
                    {shouldShowFollowBtn && (
                        <button 
                            className={`btn-follow ${isFollowing ? 'following' : ''}`} 
                            onClick={handleFollow}
                            // Style inline cho nút follow khi active (đang theo dõi)
                            style={isFollowing ? {
                                backgroundColor: 'transparent', 
                                color: '#0079d3', 
                                border: '1px solid #0079d3',
                                marginLeft: '10px' // Thêm margin để tách khỏi ngày tháng
                            } : {
                                marginLeft: '10px',
                                backgroundColor: '#0079d3',
                                color: 'white',
                                border: 'none',
                                borderRadius: '20px',
                                padding: '4px 12px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                fontSize: '12px'
                            }}
                        >
                            {isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
                        </button>
                    )}
                </div>
            </div>

            {/* 2. BODY */}
            <div className="post-body" onClick={handleContentClick} style={{cursor: isModalView ? 'default' : 'pointer'}}>
                <h3 className="post-title">{post.title}</h3>
                {post.text_content && (
                    <div className="post-content-text" style={!isModalView ? {display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden'} : {}}>
                        {post.text_content}
                    </div>
                )}
                {isImage && (
                    <div className="post-image-container" onClick={handleImageClick}>
                        <img src={post.url} alt="" className="post-image" />
                    </div>
                )}
                {post.url && !isImage && (
                    <a href={post.url} target="_blank" rel="noopener noreferrer" className="link-preview" onClick={(e) => e.stopPropagation()}>
                        🔗 {post.url}
                    </a>
                )}
            </div>

            {/* 3. FOOTER */}
            <div className="post-footer">
                <div className="vote-group">
                    <button className={`vote-btn ${voteStatus === 1 ? 'upvote-active' : ''}`} onClick={(e) => {e.stopPropagation(); handleVote(1);}}>
                        <svg className="vote-icon" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4L3 15h6v5h6v-5h6L12 4z"/></svg>
                    </button>
                    <span className={`vote-score ${voteStatus === 1 ? 'score-up' : (voteStatus === -1 ? 'score-down' : '')}`}>{score}</span>
                    <button className={`vote-btn ${voteStatus === -1 ? 'downvote-active' : ''}`} onClick={(e) => {e.stopPropagation(); handleVote(-1);}}>
                        <svg className="vote-icon" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 20L21 9h-6V4h-6v5H3L12 20z"/></svg>
                    </button>
                </div>

                <button className="action-btn" onClick={(e) => {e.stopPropagation(); handleCommentClick();}}>
                    <span className="action-icon">💬</span>
                    <span>Bình luận</span>
                </button>

                <button className="action-btn" onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
                    alert("Đã copy link");
                }}>
                    <span className="action-icon">↗</span>
                    <span>Chia sẻ</span>
                </button>
            </div>

            {/* INLINE COMMENTS */}
            {showInlineComments && !isModalView && (
                <div className="inline-comments-wrapper" style={{padding: '0 15px 15px 15px'}}>
                    <CommentSection postId={post.id} initialComments={commentsLoaded} />
                </div>
            )}

        </div>
    );
};

export default PostItem;