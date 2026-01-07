import React, { useState, useRef, useEffect, useContext } from 'react';
import { AuthContext } from '../context/authContext';
import '../css/singleShortPlayer.css';

// --- ICONS ---
const UpvoteIcon = ({ filled }) => (<svg width="28" height="28" viewBox="0 0 24 24" fill={filled ? "#ff4500" : "none"} stroke={filled ? "#ff4500" : "white"} strokeWidth="2"><path d="M12 4l-8 8h6v8h4v-8h6z" /></svg>);
const DownvoteIcon = ({ filled }) => (<svg width="28" height="28" viewBox="0 0 24 24" fill={filled ? "#7193ff" : "none"} stroke={filled ? "#7193ff" : "white"} strokeWidth="2"><path d="M12 20l8-8h-6v-8h-4v8h-6z" /></svg>);
const CommentIcon = () => (<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" color="white"><path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z"/></svg>);
const ShareIcon = () => (<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" color="white"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92 0-1.61-1.31-2.92-2.92-2.92z"/></svg>);

const SingleShortPlayer = ({ shortData, isActive, autoPlay }) => {
    const { user, api } = useContext(AuthContext);
    const videoRef = useRef(null);
    const commentInputRef = useRef(null);

    const [isPlaying, setIsPlaying] = useState(autoPlay);
    const [isCommentsVisible, setIsCommentsVisible] = useState(false);
    const [voteStatus, setVoteStatus] = useState(null); 
    const [score, setScore] = useState(0); 
    const [comments, setComments] = useState([]); 
    const [commentText, setCommentText] = useState(''); 
    const [replyingTo, setReplyingTo] = useState(null);

    useEffect(() => {
        if (isActive && autoPlay && videoRef.current) {
            videoRef.current.play().catch(() => {});
            setIsPlaying(true);
        } else if (videoRef.current) {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    }, [isActive, autoPlay]);

    useEffect(() => {
        if (isActive) {
            fetchComments();
            setScore(shortData.views || 0); 
        }
    }, [isActive, shortData.id]);

    const fetchComments = async () => {
        try {
            const res = await api.get(`/api/shorts/${shortData.id}/comments`);
            setComments(res.data);
        } catch (err) { console.error(err); }
    };

    const togglePlay = () => {
        if (isCommentsVisible) {
            setIsCommentsVisible(false);
            return;
        }
        if (videoRef.current.paused) {
            videoRef.current.play(); setIsPlaying(true);
        } else {
            videoRef.current.pause(); setIsPlaying(false);
        }
    };

    // --- CẤU TRÚC CÂY COMMENT ---
    const getCommentTree = (comments) => {
        const commentMap = {};
        const roots = [];
        comments.forEach(c => { commentMap[c.id] = { ...c, replies: [] }; });
        comments.forEach(c => {
            if (c.parent_id && commentMap[c.parent_id]) {
                commentMap[c.parent_id].replies.push(commentMap[c.id]);
            } else {
                roots.push(commentMap[c.id]);
            }
        });
        return roots;
    };

    // Component Comment con (đệ quy)
    const CommentItem = ({ comment, level = 0 }) => {
        return (
            <div style={{ marginBottom: '10px', marginLeft: level > 0 ? '20px' : '0', borderLeft: level > 0 ? '2px solid #ddd' : 'none', paddingLeft: level > 0 ? '10px' : '0' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                    
                    {/* [SỬA] Hiển thị Avatar */}
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e0e0e0', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {comment.avatar_url ? (
                            <img 
                                src={comment.avatar_url.startsWith('http') ? comment.avatar_url : `http://localhost:5001${comment.avatar_url}`} 
                                alt={comment.username}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                        ) : (
                            <span style={{ fontWeight: 'bold', fontSize: '12px', color: '#555' }}>
                                {comment.username ? comment.username.charAt(0).toUpperCase() : 'U'}
                            </span>
                        )}
                    </div>

                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: 'bold' }}>{comment.username}</div>
                        <div style={{ fontSize: '14px', color: '#333' }}>{comment.content}</div>
                        <div 
                            style={{ fontSize: '12px', color: '#666', marginTop: '4px', cursor: 'pointer', fontWeight: '600' }}
                            onClick={() => handleClickReply(comment)}
                        >
                            Trả lời
                        </div>
                    </div>
                </div>

                {comment.replies && comment.replies.length > 0 && (
                    <div style={{ marginTop: '8px' }}>
                        {comment.replies.map(reply => (
                            <CommentItem key={reply.id} comment={reply} level={level + 1} />
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const handleVote = async (type) => {
        if (!user) return alert("Vui lòng đăng nhập để vote!");
        setScore(prev => type === 'up' ? prev + 1 : prev - 1); 
        await api.post(`/api/shorts/${shortData.id}/vote`, { userId: user.userId, type });
    };

    const handleClickReply = (comment) => {
        setReplyingTo(comment);
        if (commentInputRef.current) commentInputRef.current.focus();
    };

    const handlePostComment = async () => {
        if (!user) return alert("Vui lòng đăng nhập!");
        if (!commentText.trim()) return;

        try {
            await api.post(`/api/shorts/${shortData.id}/comments`, {
                userId: user.userId,
                content: commentText,
                parentId: replyingTo ? replyingTo.id : null
            });
            setCommentText('');
            setReplyingTo(null);
            fetchComments();
        } catch (err) {
            console.error("Lỗi comment:", err);
        }
    };

    const rootComments = getCommentTree(comments);

    return (
        <div className="short-player-wrapper" style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', background: '#000' }}>
            <div className="short-video-container" onClick={togglePlay} style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <video 
                    ref={videoRef}
                    src={`http://localhost:5001${shortData.video_url}`}
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
                    loop playsInline
                />
            </div>

            {!isCommentsVisible && (
                <>
                    <div style={{ position: 'absolute', bottom: '20px', left: '15px', color: 'white', textShadow: '1px 1px 2px rgba(0,0,0,0.8)', zIndex: 10, pointerEvents: 'none' }}>
                        <h3 style={{ margin: '0 0 5px 0', fontSize: '16px' }}>{shortData.title}</h3>
                        <div style={{ fontSize: '14px' }}>@{shortData.username}</div>
                        <p style={{ margin: '0', fontSize: '13px' }}>{shortData.caption}</p>
                    </div>

                    <div style={{ position: 'absolute', right: '10px', bottom: '100px', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', zIndex: 10 }}>
                        <div onClick={() => handleVote('up')} style={{ cursor: 'pointer', padding: '10px', background: 'rgba(0,0,0,0.4)', borderRadius: '50%' }}>
                            <UpvoteIcon filled={voteStatus === 'up'} />
                        </div>
                        <span style={{ color: 'white', fontWeight: 'bold' }}>{score}</span>
                        <div onClick={() => setIsCommentsVisible(true)} style={{ cursor: 'pointer', textAlign: 'center' }}>
                            <div style={{ padding: '10px', background: 'rgba(0,0,0,0.4)', borderRadius: '50%' }}>
                                <CommentIcon />
                            </div>
                            <span style={{ color: 'white', fontSize: '12px', fontWeight: 'bold' }}>{comments.length}</span>
                        </div>
                        <div style={{ padding: '10px', background: 'rgba(0,0,0,0.4)', borderRadius: '50%' }}><ShareIcon /></div>
                    </div>
                </>
            )}

            <div className={`comments-overlay ${isCommentsVisible ? 'visible' : ''}`}>
                <div style={{ padding: '15px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white' }}>
                    <span style={{ fontWeight: 'bold' }}>Bình luận ({comments.length})</span>
                    <span onClick={() => setIsCommentsVisible(false)} style={{ cursor: 'pointer', fontSize: '20px', padding: '5px' }}>✕</span>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '15px', background: '#f9f9f9' }}>
                    {rootComments.length === 0 ? (
                        <p style={{ textAlign: 'center', color: '#888', marginTop: '20px' }}>Chưa có bình luận nào.</p>
                    ) : (
                        rootComments.map(comment => (
                            <CommentItem key={comment.id} comment={comment} />
                        ))
                    )}
                </div>

                <div style={{ padding: '10px', borderTop: '1px solid #eee', background: 'white' }}>
                    {replyingTo && (
                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px', display: 'flex', justifyContent: 'space-between' }}>
                            <span>Đang trả lời <b>{replyingTo.username}</b></span>
                            <span onClick={() => setReplyingTo(null)} style={{ cursor: 'pointer', color: 'red' }}>Hủy</span>
                        </div>
                    )}
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input 
                            ref={commentInputRef}
                            type="text" 
                            placeholder={replyingTo ? `Trả lời ${replyingTo.username}...` : "Thêm bình luận..."}
                            value={commentText}
                            onChange={e => setCommentText(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handlePostComment()}
                            style={{ flex: 1, padding: '10px', borderRadius: '20px', border: '1px solid #ddd', outline: 'none' }}
                        />
                        <button onClick={handlePostComment} style={{ background: 'transparent', border: 'none', color: '#0079d3', fontWeight: 'bold', cursor: 'pointer' }}>Gửi</button>
                    </div>
                </div>
            </div>

            <style>{`
                .comments-overlay {
                    position: absolute; bottom: 0; left: 0; right: 0;
                    height: 70%; background: white;
                    border-radius: 16px 16px 0 0; z-index: 20;
                    transform: translateY(100%); transition: transform 0.3s ease-in-out;
                    display: flex; flex-direction: column;
                    box-shadow: 0 -5px 20px rgba(0,0,0,0.3);
                }
                .comments-overlay.visible { transform: translateY(0); }
                @media (min-width: 800px) {
                    .comments-overlay {
                        left: auto; right: 0; width: 400px; height: 100%;
                        border-radius: 0; transform: translateX(100%);
                    }
                    .comments-overlay.visible { transform: translateX(0); }
                }
            `}</style>
        </div>
    );
};

export default SingleShortPlayer;