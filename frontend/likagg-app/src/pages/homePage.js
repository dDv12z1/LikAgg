import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/authContext';
import PostItem from '../components/postItem';
import PostDetailModal from '../components/postDetailModal';
import CommunityHeader from '../components/communityHeader'; // <-- Import
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom'; 
import '../css/homePage.css';

const HomePage = () => {
    // ... (Giữ nguyên các state và logic fetch data cũ) ...
    const { user, api } = useContext(AuthContext);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPostId, setSelectedPostId] = useState(null);
    const [communities, setCommunities] = useState([]); 

    const location = useLocation();
    const { communityName } = useParams(); 
    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get('search');

    const isPopularMode = location.pathname === '/popular';
    const isCommunityMode = !!communityName; 
    const isSearchMode = !!searchQuery;

    // --- STATE MỚI CHO MOBILE MENU ---
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // ... (Giữ nguyên các useEffect fetchPosts và fetchCommunities) ...
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                setLoading(true);
                let url = '/api/posts';
                const params = {};
                if (isSearchMode) params.search = searchQuery; 
                else if (isPopularMode) params.sort = 'popular'; 
                else if (isCommunityMode) params.community = `r/${communityName}`;
                const response = await api.get(url, { params });
                setPosts(response.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchPosts();
    }, [api, isPopularMode, isCommunityMode, communityName, isSearchMode, searchQuery]);

    useEffect(() => {
        const fetchCommunities = async () => {
            try {
                const response = await api.get('/api/communities');
                setCommunities(response.data);
            } catch (err) {
                console.error("Lỗi lấy communities:", err);
            }
        };
        fetchCommunities();
    }, [api]);

    const openPostModal = (postId) => {
        setSelectedPostId(postId);
        window.history.pushState(null, '', `/post/${postId}`);
    };

    const closePostModal = () => {
        setSelectedPostId(null);
        window.history.pushState(null, '', '/');
    };

    const getPageTitle = () => {
        if (isSearchMode) return `Kết quả tìm kiếm: "${searchQuery}"`;
        if (isPopularMode) return 'Bài viết Phổ biến (Popular)';
        if (isCommunityMode) return `Cộng đồng: r/${communityName}`;
        return 'Trang chủ (Home)';
    };

    const sortedCommunities = communities.slice(0, 5); 

    // --- ICON SVG ---
    const HomeIcon = () => (<svg className="nav-icon-svg" viewBox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>);
    const PopularIcon = () => (<svg className="nav-icon-svg" viewBox="0 0 24 24"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>);
    const CreateIcon = () => (<svg className="nav-icon-svg" viewBox="0 0 24 24"><path d="M12 5v14m-7-7h14" /></svg>);
    const CommunityIcon = () => (<svg className="nav-icon-svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>);
    const MenuIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>);

    // --- NỘI DUNG SIDEBAR (Tách ra để tái sử dụng cho cả Desktop và Mobile Drawer) ---
    const SidebarContent = () => (
        <>
            <div className="nav-section">
                <Link to="/" className={`nav-link ${!isPopularMode && !isCommunityMode && !isSearchMode ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
                    <HomeIcon /> Home
                </Link>
                <Link to="/popular" className={`nav-link ${isPopularMode ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
                    <PopularIcon /> Popular
                </Link>
                {user && (
                    <Link to="/submit" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                        <CreateIcon /> Create Post
                    </Link>
                )}
            </div>

            <div className="nav-section">
                <div className="nav-title">COMMUNITIES</div>
                {user && (
                    <Link to="/create-community" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                        <CommunityIcon /> Create Community
                    </Link>
                )}
                {communities.map(comm => (
                    <Link key={comm.id} to={`/r/${comm.name}`} className={`nav-link ${communityName === comm.name ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
                        <div className="community-icon" style={{backgroundColor: comm.icon_color || '#0079d3'}}>
                            {comm.name.charAt(0).toUpperCase()}
                        </div>
                        r/{comm.name}
                    </Link>
                ))}
            </div>

            {/* --- CẬP NHẬT PHẦN RESOURCES TẠI ĐÂY --- */}
            <div className="nav-section" style={{borderBottom: 'none'}}>
                <div className="nav-title">RESOURCES</div>
                <div className="footer-links">
                    <div className="footer-column">
                        <Link to="/about" className="resource-link">About Likagg</Link>
                        <Link to="/advertise" className="resource-link">Advertise</Link>
                        <Link to="/help" className="resource-link">Help</Link>
                        <Link to="/blog" className="resource-link">Blog</Link>
                        <Link to="/careers" className="resource-link">Careers</Link>
                        <Link to="/press" className="resource-link">Press</Link>
                    </div>
                    
                    <hr style={{margin: '15px 0', border: '0', borderTop: '1px solid #eee'}}/>
                    
                    <div className="footer-copyright">
                        <Link to="/terms" className="legal-link">Terms</Link>
                        <Link to="/content-policy" className="legal-link">Content Policy</Link>
                        <Link to="/privacy" className="legal-link">Privacy Policy</Link>
                        <p style={{marginTop: '10px'}}>© 2025 Likagg Inc. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </>
    );

    return (
        <div className="home-container">
            
            {/* --- MOBILE HEADER BAR (Chỉ hiện trên mobile) --- */}
            <div className="mobile-header-bar">
                <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(true)}>
                    <MenuIcon />
                    <span style={{marginLeft: '10px', fontWeight: 'bold', textTransform: 'capitalize'}}>
                        {isSearchMode ? 'Search' : (isPopularMode ? 'Popular' : (isCommunityMode ? `r/${communityName}` : 'Home'))}
                    </span>
                </button>
            </div>

            {/* --- MOBILE DRAWER (Ngăn kéo menu) --- */}
            {/* Lớp phủ đen mờ */}
            <div className={`mobile-overlay ${isMobileMenuOpen ? 'open' : ''}`} onClick={() => setIsMobileMenuOpen(false)}></div>
            
            {/* Nội dung Menu trượt ra */}
            <div className={`mobile-drawer ${isMobileMenuOpen ? 'open' : ''}`}>
                <div className="drawer-header">
                    <h3>Menu</h3>
                    <button onClick={() => setIsMobileMenuOpen(false)} style={{fontSize: '20px', cursor: 'pointer'}}>✕</button>
                </div>
                <div className="drawer-content">
                    <SidebarContent /> {/* Tái sử dụng nội dung sidebar */}
                </div>
            </div>


            {/* --- CỘT TRÁI (Desktop/Tablet) --- */}
            <div className="left-sidebar">
                <SidebarContent /> {/* Tái sử dụng nội dung sidebar */}
            </div>

            {/* --- CỘT GIỮA: POSTS --- */}
            <div className="main-content">
                {/* Ẩn tiêu đề cũ trên mobile vì đã có Mobile Header Bar */}
                <h3 className="page-title-desktop" style={{marginBottom: '15px', marginTop: '0', textTransform: 'capitalize'}}>
                    {getPageTitle()}
                </h3>
                
                {/* --- HIỂN THỊ HEADER NẾU ĐANG Ở TRANG CỘNG ĐỒNG --- */}
                {isCommunityMode && (
                    <CommunityHeader communityName={communityName} />
                )}

                <div className="posts-container">
                    {loading ? (
                        <p>Loading...</p>
                    ) : (
                        <div className="posts-list">
                            {posts.length > 0 ? (
                                posts.map(post => (
                                    <div key={post.id} className="post-card-wrapper" style={{marginBottom: '10px'}}>
                                        <PostItem post={post} onPostClick={openPostModal} />
                                    </div>
                                ))
                            ) : (
                                <div style={{textAlign: 'center', padding: '20px', color: '#777'}}>
                                    <p>{isSearchMode ? "Không tìm thấy bài viết." : "Chưa có bài đăng nào."}</p>
                                    {isCommunityMode && user && (
                                        <Link to="/submit" style={{color: '#0079d3', fontWeight: 'bold'}}>Tạo bài đăng ngay!</Link>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* --- CỘT PHẢI (Desktop) --- */}
            <div className="right-sidebar">
                <div className="famous-box">
                    <div className="famous-title">POPULAR COMMUNITIES</div>
                    <div className="famous-list">
                        {sortedCommunities.map((comm, index) => (
                            <Link key={comm.id} to={`/r/${comm.name}`} className="famous-item">
                                <span className="famous-rank">{index + 1}</span>
                                <div className="community-icon small" style={{backgroundColor: comm.icon_color || '#0079d3'}}>
                                    {comm.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="famous-info"><span className="famous-name">r/{comm.name}</span></div>
                            </Link>
                        ))}
                    </div>
                    <button className="see-all-btn">See All</button>
                </div>
            </div>

            {/* MODAL */}
            {selectedPostId && <PostDetailModal postId={selectedPostId} onClose={closePostModal} />}

        </div>
    );
};

export default HomePage;