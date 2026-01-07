import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/authContext';
import PostItem from '../components/postItem';
import UserListModal from '../components/userListModal';
import PostDetailModal from '../components/postDetailModal';
import '../css/userProfile.css';

const UserProfile = () => {
    const { username } = useParams();
    const { api, user: currentUser } = useContext(AuthContext);
    
    // Data States
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [comments, setComments] = useState([]); // State cho bình luận
    const [communities, setCommunities] = useState([]);
    
    // UI States
    const [isFollowing, setIsFollowing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('posts'); // [1] State quản lý Tab đang chọn

    // Modal States
    const [showModal, setShowModal] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalUsers, setModalUsers] = useState([]);
    const [selectedPostId, setSelectedPostId] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/api/users/${username}`);
                setProfile(res.data.user);
                setPosts(res.data.posts);
                setComments(res.data.comments || []); // Đảm bảo API trả về comments nếu cần
                setCommunities(res.data.communities);
                setLoading(false);
            } catch (err) {
                console.error("Lỗi load profile:", err);
                setLoading(false);
            }
        };
        fetchProfile();
    }, [api, username]);

    useEffect(() => {
        const checkFollow = async () => {
            if (currentUser && profile && currentUser.id !== profile.id) {
                try {
                    const res = await api.get(`/api/users/${username}/is-following`);
                    setIsFollowing(res.data.isFollowing);
                } catch (err) { console.error(err); }
            }
        };
        if(profile) checkFollow();
    }, [api, currentUser, username, profile]);

    const handleFollow = async () => {
        if (!currentUser) return alert("Vui lòng đăng nhập!");
        try {
            if (isFollowing) {
                await api.delete(`/api/users/${username}/follow`);
                setProfile(prev => ({
                    ...prev,
                    stats: { ...prev.stats, followers_count: (prev.stats?.followers_count || 0) - 1 }
                }));
            } else {
                await api.post(`/api/users/${username}/follow`);
                setProfile(prev => ({
                    ...prev,
                    stats: { ...prev.stats, followers_count: (prev.stats?.followers_count || 0) + 1 }
                }));
            }
            setIsFollowing(!isFollowing);
        } catch (err) { console.error("Lỗi follow:", err); }
    };

    const openFollowList = async (type) => {
        if (!profile) return;
        setModalTitle(type === 'followers' ? 'Người theo dõi' : 'Đang theo dõi');
        setModalUsers([]);
        setShowModal(true);
        try {
            const endpoint = type === 'followers' 
                ? `/api/users/${profile.id}/followers-list`
                : `/api/users/${profile.id}/following-list`;
            const res = await api.get(endpoint);
            setModalUsers(res.data);
        } catch (err) { console.error("Lỗi lấy danh sách user:", err); }
    };

    const handlePostClick = (postId) => {
        setSelectedPostId(postId);
    };

    const handleClosePostModal = () => {
        setSelectedPostId(null);
    };

    const getAvatarUrl = (avatar) => {
        const BACKEND_URL = 'http://localhost:5001';
        if (!avatar) return `${BACKEND_URL}/uploads/new.png`;
        if (avatar.startsWith('http')) return avatar;
        return `${BACKEND_URL}/uploads/${avatar}`;
    };

    if (loading) return <div style={{textAlign: 'center', marginTop: '50px'}}>Đang tải...</div>;
    if (!profile) return <div style={{textAlign: 'center', marginTop: '50px'}}>Không tìm thấy người dùng</div>;

    return (
        <div className="profile-container">
            {/* HEADER */}
            <div className="profile-header">
                <div className="profile-cover"></div> 
                <div className="profile-info-wrapper">
                    <div className="profile-avatar-container">
                        <img 
                            src={getAvatarUrl(profile.avatar)}
                            alt={profile.username} 
                            className="profile-avatar"
                            onError={(e) => {
                                e.target.onerror = null; 
                                e.target.src = "http://localhost:5001/uploads/new.png";
                            }}
                        />
                    </div>
                    <div className="profile-details">
                        <h1 className="profile-username">{profile.username}</h1>
                        <span className="profile-handle">u/{profile.username}</span>
                    </div>
                    <div className="profile-actions">
                        {currentUser && currentUser.username !== username && (
                            <button 
                                className={`action-btn ${isFollowing ? 'btn-outline' : 'btn-primary'}`}
                                onClick={handleFollow}
                            >
                                {isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
                            </button>
                        )}
                    </div>
                </div>

                {/* [2] NAVIGATION TABS (Đã sửa logic click) */}
                <div className="profile-nav">
                    <div 
                        className={`nav-item ${activeTab === 'posts' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('posts')}
                    >
                        Bài viết
                    </div>
                    <div 
                        className={`nav-item ${activeTab === 'comments' ? 'active' : ''}`}
                        onClick={() => setActiveTab('comments')}
                    >
                        Bình luận
                    </div>
                    {/* Đã xóa tab Giới thiệu */}
                </div>
            </div>

            {/* CONTENT */}
            <div className="profile-content">
                <div className="profile-feed">
                    {/* [3] Render nội dung theo Tab */}
                    {activeTab === 'posts' && (
                        posts.length > 0 ? (
                            posts.map(post => (
                                <div key={post.id} style={{marginBottom: '10px'}}>
                                    <PostItem 
                                        post={post} 
                                        isPreview={true} 
                                        onClick={() => handlePostClick(post.id)}
                                    />
                                </div>
                            ))
                        ) : (
                            <div className="info-card" style={{textAlign: 'center', padding: '40px', color: '#777'}}>
                                <h3>Chưa có bài viết nào</h3>
                                <p>Các bài viết của {profile.username} sẽ xuất hiện tại đây.</p>
                            </div>
                        )
                    )}

                    {activeTab === 'comments' && (
                        comments.length > 0 ? (
                            comments.map(post => (
                                <div key={post.id} style={{marginBottom: '10px'}}>
                                    {/* Hiển thị bài viết mà user đã bình luận */}
                                    <PostItem 
                                        post={post} 
                                        isPreview={true} 
                                        onClick={() => handlePostClick(post.id)}
                                    />
                                </div>
                            ))
                        ) : (
                            <div className="info-card" style={{textAlign: 'center', padding: '40px', color: '#777'}}>
                                <h3>Chưa có bình luận nào</h3>
                                <p>Các bài viết mà {profile.username} đã bình luận sẽ xuất hiện tại đây.</p>
                            </div>
                        )
                    )}
                </div>

                <div className="profile-sidebar">
                    <div className="info-card">
                        {/* [4] Đã xóa phần Bio/Giới thiệu text */}
                        <div style={{fontSize: '13px', color: '#555', marginBottom: '10px'}}>
                            🎂 Tham gia: {new Date(profile.created_at).toLocaleDateString()}
                        </div>
                        <div className="stats-grid">
                            <div className="stat-box" onClick={() => openFollowList('following')}>
                                <span className="stat-num">{profile.stats?.following_count || 0}</span>
                                <span className="stat-label">Đang theo dõi</span>
                            </div>
                            <div className="stat-box" onClick={() => openFollowList('followers')}>
                                <span className="stat-num">{profile.stats?.followers_count || 0}</span>
                                <span className="stat-label">Người theo dõi</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="info-card">
                        <h4 className="info-title">Cộng đồng</h4>
                        <div className="comm-tags">
                            {communities.length > 0 ? communities.map((c, idx) => (
                                <span key={idx} className="comm-tag">r/{c.community}</span>
                            )) : <span style={{color: '#777', fontSize: '13px'}}>Chưa tham gia cộng đồng nào.</span>}
                        </div>
                    </div>
                </div>
            </div>

            {showModal && (
                <UserListModal 
                    title={modalTitle}
                    users={modalUsers}
                    onClose={() => setShowModal(false)}
                />
            )}

            {selectedPostId && (
                <PostDetailModal 
                    postId={selectedPostId} 
                    onClose={handleClosePostModal} 
                />
            )}
        </div>
    );
};

export default UserProfile;