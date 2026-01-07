import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/authContext';
import '../css/communityHeader.css';

const CommunityHeader = ({ communityName }) => {
    const { user, api } = useContext(AuthContext);
    const [communityData, setCommunityData] = useState(null);
    const [isJoined, setIsJoined] = useState(false);
    const [memberCount, setMemberCount] = useState(0);

    // Load thông tin cộng đồng
    useEffect(() => {
        const fetchCommunityInfo = async () => {
            try {
                // API này cần backend trả về thêm description, member_count, icon_color
                // Tạm thời giả định backend trả về đủ hoặc ta fake data nếu thiếu
                // Thực tế nên gọi: GET /api/communities/:name
                
                // Vì chưa có API get detail 1 community, ta sẽ dùng API get all và find (tạm thời)
                // Hoặc tốt nhất là viết thêm API GET /api/communities/:name ở backend
                const res = await api.get('/api/communities'); 
                const found = res.data.find(c => c.name === communityName);
                
                if (found) {
                    setCommunityData(found);
                    // Fake member count nếu DB chưa có
                    setMemberCount(found.member_count || Math.floor(Math.random() * 10000));
                }
            } catch (err) {
                console.error("Lỗi load info cộng đồng", err);
            }
        };
        fetchCommunityInfo();
    }, [api, communityName]);

    // Check Join Status
    useEffect(() => {
        const checkJoin = async () => {
            if (user) {
                try {
                    const res = await api.get(`/api/communities/${communityName}/is-joined`);
                    setIsJoined(res.data.isJoined);
                } catch (err) { console.error(err); }
            }
        };
        checkJoin();
    }, [api, communityName, user]);

    const handleJoin = async () => {
        if (!user) return alert("Vui lòng đăng nhập!");
        try {
            const res = await api.post(`/api/communities/${communityName}/join`);
            setIsJoined(res.data.isJoined);
            // Cập nhật số member ảo để UI sinh động
            setMemberCount(prev => res.data.isJoined ? prev + 1 : prev - 1);
        } catch (err) { alert("Lỗi thao tác"); }
    };

    if (!communityData) return null; // Hoặc loading skeleton

    return (
        <div className="comm-header-container">
            {/* Banner màu (giống Reddit) */}
            <div className="comm-banner" style={{backgroundColor: communityData.icon_color || '#33a8ff'}}></div>
            
            <div className="comm-content">
                <div className="comm-content-inner">
                    {/* Icon to */}
                    <div className="comm-icon-large" style={{backgroundColor: communityData.icon_color || '#33a8ff'}}>
                        {/* Avatar cộng đồng (Nếu có ảnh thì hiện ảnh, không thì chữ cái đầu) */}
                        {communityData.name.charAt(0).toUpperCase()}
                    </div>
                    
                    <div className="comm-text">
                        <h1 className="comm-title">{communityData.description || `Welcome to r/${communityData.name}`}</h1>
                        <span className="comm-name">r/{communityData.name}</span>
                    </div>

                    <div className="comm-actions">
                        <button 
                            className={`comm-join-btn ${isJoined ? 'joined' : ''}`}
                            onClick={handleJoin}
                        >
                            {isJoined ? 'Joined' : 'Join'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommunityHeader;