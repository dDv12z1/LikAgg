import React from 'react';
import { Link } from 'react-router-dom';
import '../css/shortsStrip.css';

const ShortsStrip = ({ shorts, onShortClick }) => {
    return (
        <div className="shorts-strip-container">
            <h4 className="shorts-header">
                {/* [FIX] Thay thế path SVG bị lỗi bằng icon Play Circle chuẩn */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="red">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                </svg>
                Shorts
            </h4>
            <div className="shorts-scroll-view">
                {shorts.map(short => (
                    <div 
                        key={short.id} 
                        className="short-card" 
                        onClick={() => onShortClick && onShortClick(short)} 
                    >
                        {/* [FIX] Kiểm tra video_url và xử lý Promise của hàm play() */}
                        {short.video_url ? (
                            <video 
                                src={`http://localhost:5001${short.video_url}`} 
                                className="short-video-thumb"
                                muted
                                onMouseOver={event => {
                                    const playPromise = event.target.play();
                                    // Chặn lỗi "Uncaught (in promise)" nếu video chưa sẵn sàng hoặc bị browser chặn
                                    if (playPromise !== undefined) {
                                        playPromise.catch(error => {
                                            // Lỗi này thường do user lướt chuột qua quá nhanh
                                            // hoặc video chưa load xong metadata. Có thể bỏ qua.
                                            console.log("Auto-play prevented:", error); 
                                        });
                                    }
                                }}
                                onMouseOut={event => event.target.pause()}
                                onError={(e) => console.error("Lỗi tải video:", e)} // Log nếu URL sai (404)
                            />
                        ) : (
                            // Hiển thị khung đen nếu không có URL video
                            <div className="short-video-thumb" style={{background: '#000', display:'flex', alignItems:'center', justifyContent:'center'}}>
                                ⚠️
                            </div>
                        )}
                        
                        <div className="short-info">
                            <span className="short-caption">{short.caption || short.title}</span>
                            <span className="short-user">@{short.username}</span>
                        </div>
                    </div>
                ))}
                
                {/* Nút tạo Short */}
                <Link to="/create-short" className="create-short-card">
                    <span className="plus-icon">+</span>
                    <span>Create Short</span>
                </Link>
            </div>
        </div>
    );
};

export default ShortsStrip;