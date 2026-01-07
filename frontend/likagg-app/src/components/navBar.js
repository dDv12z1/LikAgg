import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/authContext';
import AuthModal from './authModal'; 
import '../css/navBar.css';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
    
    // --- STATE CHO MODAL ---
    const [isAuthModalOpen, setAuthModalOpen] = useState(false);
    const [authModalMode, setAuthModalMode] = useState('login'); 

    const [searchQuery, setSearchQuery] = useState('');
    const [searchParams] = useSearchParams();
    const queryParam = searchParams.get('search');

    useEffect(() => {
        if (queryParam) {
            setSearchQuery(queryParam);
        }
    }, [queryParam]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        logout();
    };

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            if (searchQuery.trim()) {
                navigate(`/?search=${encodeURIComponent(searchQuery)}`);
            } else {
                navigate('/');
            }
        }
    };

    const openAuthModal = (mode) => {
        setAuthModalMode(mode);
        setAuthModalOpen(true);
    };

    return (
        <>
            <nav className="navbar">
                {/* 1. LOGO */}
                <Link to="/" className="nav-logo" onClick={() => setSearchQuery('')}>
                    <svg className="nav-icon-svg" style={{width:'32px', height:'32px', marginRight:'8px', color:'#ff4500'}} viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="12" cy="12" r="10" />
                    </svg>
                    <span className="nav-logo-text">Likagg</span>
                </Link>

                {/* 2. SEARCH BAR */}
                <div className="nav-search">
                    <input 
                        type="text" 
                        placeholder="Search Likagg" 
                        className="search-bar" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleSearch}
                    />
                    <span className="search-icon-placeholder">🔍</span>
                </div>

                {/* 3. ACTIONS / USER */}
                <div className="nav-actions">
                    {user ? (
                        <>
                            <button className="nav-icon-btn mobile-hide" title="Popular" onClick={() => navigate('/popular')}>
                                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                            </button>
                            <button className="nav-icon-btn" title="Create" onClick={() => navigate('/submit')}>
                                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" /></svg>
                            </button>

                            {/* User Menu Dropdown */}
                            <div className="user-menu-container" ref={dropdownRef}>
                                <button 
                                    className="user-toggle" 
                                    onClick={() => setShowDropdown(!showDropdown)}
                                >
                                    <div className="user-avatar-small">
                                        {user.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="user-info-text mobile-hide">
                                        <span className="user-name">{user.username}</span>
                                        <span className="user-karma">1 karma</span>
                                    </div>
                                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20" style={{color: '#878a8c'}}>
                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>

                                {/* Dropdown Content */}
                                <div className={`user-dropdown ${showDropdown ? 'show' : ''}`}>
                                    {/* Link đến Profile */}
                                    <button 
                                        className="dropdown-item" 
                                        onClick={() => {
                                            navigate(`/u/${user.username}`); 
                                            setShowDropdown(false);
                                        }}
                                    >
                                        Profile
                                    </button>
                                    
                                    {/* --- TÍCH HỢP NÚT SETTINGS --- */}
                                    <button 
                                        className="dropdown-item" 
                                        onClick={() => {
                                            navigate('/settings'); // Chuyển đến trang cài đặt
                                            setShowDropdown(false); // Đóng menu
                                        }}
                                    >
                                        User Settings
                                    </button>
                                    {/* --------------------------- */}

                                    <div className="dropdown-divider"></div>
                                    <button className="dropdown-item" onClick={handleLogout}>Log Out</button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="auth-buttons">
                            <button className="btn-login" onClick={() => openAuthModal('login')}>Log In</button>
                            <button className="btn-register" onClick={() => openAuthModal('register')}>Sign Up</button>
                        </div>
                    )}
                </div>
            </nav>

            <AuthModal 
                isOpen={isAuthModalOpen} 
                onClose={() => setAuthModalOpen(false)} 
                initialMode={authModalMode}
            />
        </>
    );
};

export default Navbar;