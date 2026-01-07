import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/authContext';
import PostItem from '../components/postItem';
import PostDetailModal from '../components/postDetailModal';
import CommunityHeader from '../components/communityHeader'; 
import ShortsStrip from '../components/shortsStrip'; 
import ShortsModal from '../components/shortsModal';
import ShortsFeedPage from './shortsFeedPage';
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom'; 
import '../css/homePage.css';

const HomePage = () => {
    const { user, api } = useContext(AuthContext);
    
    // --- STATE ---
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPostId, setSelectedPostId] = useState(null);
    const [communities, setCommunities] = useState([]); 

    const [shorts, setShorts] = useState([]); 
    const [popularShorts, setPopularShorts] = useState([]);
    const [popularTab, setPopularTab] = useState('communities'); 
    
    const [selectedShort, setSelectedShort] = useState(null); 

    const location = useLocation();
    const { communityName } = useParams(); 
    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get('search');

    const isPopularMode = location.pathname === '/popular';
    const isCommunityMode = !!communityName; 
    const isSearchMode = !!searchQuery;
    const isShortsMode = location.pathname === '/shorts'; 

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                let url = '/api/posts';
                const params = {};
                if (isSearchMode) params.search = searchQuery; 
                else if (isPopularMode) params.sort = 'popular'; 
                else if (isCommunityMode) params.community = `r/${communityName}`;
                
                const postsRes = await api.get(url, { params });
                setPosts(postsRes.data);

                if (!isCommunityMode && !isSearchMode) {
                    const shortsRes = await api.get('/api/shorts');
                    setShorts(shortsRes.data);
                }
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchData();
    }, [api, isPopularMode, isCommunityMode, communityName, isSearchMode, searchQuery]);

    useEffect(() => {
        const fetchSidebarData = async () => {
            try {
                const commRes = await api.get('/api/communities');
                setCommunities(commRes.data);
                const popShortsRes = await api.get('/api/shorts/popular');
                setPopularShorts(popShortsRes.data);
            } catch (err) { console.error(err); }
        };
        fetchSidebarData();
    }, [api]);

    const openPostModal = (postId) => setSelectedPostId(postId);
    const closePostModal = () => setSelectedPostId(null);
    
    const openShortPopup = (shortData) => setSelectedShort(shortData);
    const closeShortPopup = () => setSelectedShort(null);

    const getPageTitle = () => {
        if (isShortsMode) return 'Shorts Feed';
        if (isSearchMode) return `Kết quả: "${searchQuery}"`;
        if (isPopularMode) return 'Phổ biến';
        if (isCommunityMode) return `r/${communityName}`;
        return 'Trang chủ';
    };

    const sortedCommunities = communities.slice(0, 5); 

    // --- ICONS ---
    const HomeIcon = () => (<svg className="nav-icon-svg" viewBox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>);
    const PopularIcon = () => (<svg className="nav-icon-svg" viewBox="0 0 24 24"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>);
    const CreateIcon = () => (<svg className="nav-icon-svg" viewBox="0 0 24 24"><path d="M12 5v14m-7-7h14" /></svg>);
    const CommunityIcon = () => (<svg className="nav-icon-svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>);
    const MenuIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>);
    const ShortsIcon = () => (<svg className="nav-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>);

    const SidebarContent = () => (
        <>
            <div className="nav-section">
                <Link to="/" className={`nav-link ${!isPopularMode && !isCommunityMode && !isSearchMode && !isShortsMode ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
                    <HomeIcon /> Home
                </Link>
                <Link to="/popular" className={`nav-link ${isPopularMode ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
                    <PopularIcon /> Popular
                </Link>
                <Link to="/shorts" className={`nav-link ${isShortsMode ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
                    <ShortsIcon /> Shorts
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

            {/* --- [MỚI] PHẦN RESOURCES ĐƯỢC THÊM LẠI --- */}
            <div className="nav-section" style={{borderBottom: 'none'}}>
                <div className="nav-title">RESOURCES</div>
                <div className="footer-links">
                    <div className="footer-column">
                        <Link to="/about" className="resource-link">About Likagg</Link>
                        <Link to="/help" className="resource-link">Help</Link>
                        <Link to="/content-policy" className="resource-link">Content Policy</Link>
                        <Link to="/privacy" className="resource-link">Privacy Policy</Link>
                    </div>
                    <hr style={{margin: '15px 0', border: '0', borderTop: '1px solid #eee'}}/>
                    <div className="footer-copyright">
                        <p>© 2025 Likagg Inc.</p>
                    </div>
                </div>
            </div>
        </>
    );

    return (
        <div className="home-container">
            <div className="mobile-header-bar">
                 <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(true)}>
                    <MenuIcon />
                </button>
            </div>
             <div className={`mobile-overlay ${isMobileMenuOpen ? 'open' : ''}`} onClick={() => setIsMobileMenuOpen(false)}></div>
            <div className={`mobile-drawer ${isMobileMenuOpen ? 'open' : ''}`}>
                 <div className="drawer-content"><SidebarContent /></div>
            </div>

            {/* Cột Trái */}
            <div className="left-sidebar">
                <SidebarContent />
            </div>

            {/* Cột Giữa */}
            <div className="main-content">
                {isShortsMode ? (
                    <ShortsFeedPage />
                ) : (
                    <>
                        <h3 className="page-title-desktop" style={{marginBottom: '15px', marginTop: '0', textTransform: 'capitalize'}}>
                            {getPageTitle()}
                        </h3>
                        
                        {isCommunityMode && <CommunityHeader communityName={communityName} />}

                        {!isCommunityMode && !isSearchMode && !isPopularMode && (
                            <ShortsStrip shorts={shorts} onShortClick={openShortPopup} /> 
                        )}

                        <div className="posts-container">
                            {loading ? <p>Loading...</p> : (
                                <div className="posts-list">
                                    {posts.length > 0 ? posts.map(post => (
                                        <div key={post.id} className="post-card-wrapper" style={{marginBottom: '10px'}}>
                                            <PostItem post={post} onPostClick={openPostModal} />
                                        </div>
                                    )) : <div style={{textAlign: 'center', padding: '20px', color: '#777'}}>Không có bài viết.</div>}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Cột Phải */}
            {!isShortsMode && (
                <div className="right-sidebar">
                    <div className="famous-box">
                        <div className="famous-title" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <span>POPULAR</span>
                            <div style={{fontSize: '11px', fontWeight: 'normal'}}>
                                <span onClick={() => setPopularTab('communities')} style={{cursor: 'pointer', fontWeight: popularTab==='communities'?'bold':'normal', marginRight:'8px'}}>COMMUNITIES</span>
                                |
                                <span onClick={() => setPopularTab('shorts')} style={{cursor: 'pointer', fontWeight: popularTab==='shorts'?'bold':'normal', marginLeft:'8px'}}>SHORTS</span>
                            </div>
                        </div>
                        <div className="famous-list">
                            {popularTab === 'communities' && sortedCommunities.map((comm, index) => (
                                <Link key={comm.id} to={`/r/${comm.name}`} className="famous-item">
                                    <span className="famous-rank">{index + 1}</span>
                                    <div className="community-icon small" style={{backgroundColor: comm.icon_color || '#0079d3'}}>
                                        {comm.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="famous-info"><span className="famous-name">r/{comm.name}</span></div>
                                </Link>
                            ))}
                            {popularTab === 'shorts' && popularShorts.map((short, index) => (
                                <div key={short.id} className="famous-item" onClick={() => openShortPopup(short)} style={{cursor: 'pointer'}}>
                                    <span className="famous-rank">{index + 1}</span>
                                    <div className="famous-info"><span className="famous-name">{short.title}</span></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {selectedPostId && <PostDetailModal postId={selectedPostId} onClose={closePostModal} />}
            {selectedShort && <ShortsModal shortData={selectedShort} onClose={closeShortPopup} />}
        </div>
    );
};

export default HomePage;