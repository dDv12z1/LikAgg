import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/authContext';
import SingleShortPlayer from '../components/singleShortPlayer';
import '../css/homePage.css'; // Sử dụng chung style hoặc tạo file riêng nếu cần

const ShortsFeedPage = () => {
    const { api } = useContext(AuthContext);
    const [shorts, setShorts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeVideoId, setActiveVideoId] = useState(null);
    
    const feedRef = useRef(null);

    useEffect(() => {
        const fetchShorts = async () => {
            try {
                const res = await api.get('/api/shorts');
                setShorts(res.data);
                if (res.data.length > 0) setActiveVideoId(res.data[0].id);
            } catch (err) {
                console.error("Lỗi lấy shorts:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchShorts();
    }, [api]);

    // Xử lý cuộn để auto-play
    const handleScroll = () => {
        if (!feedRef.current) return;
        const container = feedRef.current;
        const items = container.querySelectorAll('.short-snap-item');
        
        // Tìm video đang ở giữa khung nhìn nhất
        let closest = null;
        let minDiff = Infinity;
        const containerCenter = container.getBoundingClientRect().top + container.clientHeight / 2;

        items.forEach(item => {
            const rect = item.getBoundingClientRect();
            const itemCenter = rect.top + rect.height / 2;
            const diff = Math.abs(containerCenter - itemCenter);
            if (diff < minDiff) {
                minDiff = diff;
                closest = item;
            }
        });

        if (closest) {
            const id = parseInt(closest.getAttribute('data-id'));
            if (id !== activeVideoId) setActiveVideoId(id);
        }
    };

    useEffect(() => {
        const container = feedRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
            return () => container.removeEventListener('scroll', handleScroll);
        }
    }, [activeVideoId]);

    if (loading) return <div style={{padding:'20px', textAlign:'center'}}>Loading Shorts...</div>;

    return (
        <div 
            className="shorts-feed-wrapper" 
            ref={feedRef}
            style={{
                height: 'calc(100vh - 80px)', // Trừ đi chiều cao header/navbar
                overflowY: 'scroll',
                scrollSnapType: 'y mandatory',
                backgroundColor: '#111', // Nền tối cho feed
                borderRadius: '8px',
                position: 'relative'
            }}
        >
            {shorts.map((short) => (
                <div 
                    key={short.id} 
                    data-id={short.id}
                    className="short-snap-item"
                    style={{
                        height: '100%', // Mỗi video chiếm trọn chiều cao container
                        width: '100%',
                        scrollSnapAlign: 'start',
                        position: 'relative',
                        display: 'flex',
                        justifyContent: 'center',
                        borderBottom: '1px solid #222'
                    }}
                >
                    <SingleShortPlayer 
                        shortData={short} 
                        isActive={short.id === activeVideoId}
                        autoPlay={true}
                    />
                </div>
            ))}
        </div>
    );
};

export default ShortsFeedPage;