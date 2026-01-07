import React from 'react';
import { Link } from 'react-router-dom';
import '../css/aboutPage.css'; // Chúng ta sẽ tạo file CSS riêng cho trang này để dễ quản lý

const AboutPage = () => {
    return (
        <div className="about-container">
            {/* --- HERO SECTION --- */}
            <section className="about-hero">
                <div className="hero-content">
                    <h1 className="hero-title">Kết nối đam mê,<br />chia sẻ câu chuyện.</h1>
                    <p className="hero-subtitle">Likagg là nơi hàng triệu người dùng tụ họp để thảo luận về những điều họ yêu thích nhất.</p>
                    <div className="hero-buttons">
                        <Link to="/register" className="btn btn-primary">Tham gia ngay</Link>
                        <Link to="/popular" className="btn btn-outline">Khám phá</Link>
                    </div>
                </div>
                <div className="hero-image-placeholder">
                    {/* Bạn có thể thay thế bằng thẻ <img src="..." /> sau này */}
                    <div className="floating-card card-1">🚀 <span>Technology</span></div>
                    <div className="floating-card card-2">🎮 <span>Gaming</span></div>
                    <div className="floating-card card-3">🎨 <span>Art</span></div>
                </div>
            </section>

            {/* --- STATS SECTION --- */}
            <section className="about-stats">
                <div className="stat-item">
                    <span className="stat-number">1M+</span>
                    <span className="stat-label">Người dùng hoạt động</span>
                </div>
                <div className="stat-item">
                    <span className="stat-number">50K+</span>
                    <span className="stat-label">Cộng đồng (Sub-likagg)</span>
                </div>
                <div className="stat-item">
                    <span className="stat-number">100K+</span>
                    <span className="stat-label">Bài viết mỗi ngày</span>
                </div>
            </section>

            {/* --- MISSION SECTION --- */}
            <section className="about-mission">
                <div className="mission-text">
                    <h2>Sứ mệnh của chúng tôi</h2>
                    <p>
                        Chúng tôi tin rằng Internet nên là một nơi để mọi người cảm thấy thuộc về. 
                        Likagg được xây dựng để mang lại quyền lực cho cộng đồng, giúp mọi người dễ dàng tìm thấy những người có cùng sở thích, 
                        từ những chủ đề phổ biến nhất đến những ngách nhỏ nhất.
                    </p>
                    <p>
                        Tại đây, nội dung hay nhất được quyết định bởi chính cộng đồng thông qua hệ thống Upvote/Downvote, 
                        đảm bảo những gì bạn thấy luôn là những gì chất lượng nhất.
                    </p>
                </div>
            </section>

            {/* --- VALUES SECTION --- */}
            <section className="about-values">
                <h2>Giá trị cốt lõi</h2>
                <div className="values-grid">
                    <div className="value-card">
                        <div className="value-icon-bg" style={{background: '#e3f2fd', color: '#0079d3'}}>🤝</div>
                        <h3>Cộng đồng là trên hết</h3>
                        <p>Mọi tính năng chúng tôi xây dựng đều nhằm phục vụ lợi ích của người dùng và các cộng đồng.</p>
                    </div>
                    <div className="value-card">
                        <div className="value-icon-bg" style={{background: '#fce4ec', color: '#e91e63'}}>🛡️</div>
                        <h3>An toàn & Riêng tư</h3>
                        <p>Chúng tôi cam kết bảo vệ dữ liệu và tạo ra môi trường thảo luận lành mạnh, văn minh.</p>
                    </div>
                    <div className="value-card">
                        <div className="value-icon-bg" style={{background: '#e8f5e9', color: '#4caf50'}}>💡</div>
                        <h3>Tự do sáng tạo</h3>
                        <p>Khuyến khích mọi ý tưởng mới lạ, độc đáo và sự đa dạng trong quan điểm.</p>
                    </div>
                </div>
            </section>

            {/* --- CTA SECTION --- */}
            <section className="about-cta">
                <h2>Bạn đã sẵn sàng tham gia?</h2>
                <p>Gia nhập cộng đồng Likagg ngay hôm nay.</p>
                <Link to="/register" className="btn btn-large">Tạo tài khoản miễn phí</Link>
            </section>
        </div>
    );
};

export default AboutPage;