import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../css/staticPage.css';

const InfoPage = ({ type }) => {
    // State để lưu chủ đề đang được chọn xem chi tiết (cho trang Help)
    const [selectedHelpTopic, setSelectedHelpTopic] = useState(null);

    // --- DỮ LIỆU CHI TIẾT CHO HELP CENTER ---
    const helpTopicsData = {
        "account": {
            id: "account",
            icon: "👤",
            title: "Tài khoản & Bảo mật",
            desc: "Hướng dẫn đăng ký, đăng nhập, khôi phục mật khẩu và bảo vệ tài khoản.",
            detailContent: (
                <>
                    <h3>1. Làm sao để đăng ký tài khoản?</h3>
                    <p>Nhấn vào nút "Sign Up" ở góc trên bên phải, điền Email, Tên hiển thị và Mật khẩu. Bạn sẽ nhận được email xác nhận để kích hoạt tài khoản.</p>
                    
                    <h3>2. Tôi quên mật khẩu?</h3>
                    <p>Tại màn hình Đăng nhập, chọn "Quên mật khẩu". Nhập email của bạn và chúng tôi sẽ gửi liên kết đặt lại mật khẩu.</p>
                    
                    <h3>3. Làm sao để đổi ảnh đại diện?</h3>
                    <p>Vào trang cá nhân (Profile) -> Nhấn nút "Edit Profile" -> Chọn ảnh mới từ thiết bị của bạn.</p>
                    
                    <h3>4. Bảo mật tài khoản</h3>
                    <p>Không chia sẻ mật khẩu với bất kỳ ai. Nhân viên Likagg sẽ không bao giờ hỏi mật khẩu của bạn.</p>
                </>
            )
        },
        "posting": {
            id: "posting",
            icon: "📝",
            title: "Đăng bài & Cộng đồng",
            desc: "Cách tạo bài viết, tạo cộng đồng mới và quản lý nội dung.",
            detailContent: (
                <>
                    <h3>1. Quy trình đăng bài</h3>
                    <p>Nhấn nút "Create Post" (dấu cộng), chọn loại bài đăng (Văn bản, Hình ảnh, Link), chọn Cộng đồng đích và nhấn Đăng.</p>
                    
                    <h3>2. Karma là gì?</h3>
                    <p>Karma là điểm số uy tín của bạn, được tính dựa trên số lượng Upvote bạn nhận được từ bài viết và bình luận.</p>
                    
                    <h3>3. Làm sao để tạo Cộng đồng (Sub-likagg)?</h3>
                    <p>Bạn cần tài khoản hoạt động ít nhất 30 ngày và có một lượng Karma nhất định để được phép tạo cộng đồng mới.</p>
                </>
            )
        },
        "rules": {
            id: "rules",
            icon: "🛡️",
            title: "Quy tắc & An toàn",
            desc: "Tìm hiểu về tiêu chuẩn cộng đồng và báo cáo vi phạm.",
            detailContent: (
                <>
                    <h3>1. Tiêu chuẩn cộng đồng</h3>
                    <p>Likagg cấm các nội dung thù ghét, quấy rối, bạo lực, nội dung khiêu dâm trái phép và thông tin sai lệch.</p>
                    
                    <h3>2. Báo cáo vi phạm</h3>
                    <p>Nếu thấy nội dung xấu, hãy nhấn nút "Report" (dấu 3 chấm) ở góc bài viết/bình luận. Đội ngũ quản trị sẽ xem xét trong 24h.</p>
                    
                    <h3>3. Chặn người dùng</h3>
                    <p>Bạn có thể chặn người dùng khác để họ không thể tương tác hoặc nhắn tin cho bạn.</p>
                </>
            )
        },
        "tech": {
            id: "tech",
            icon: "⚙️",
            title: "Kỹ thuật & Lỗi",
            desc: "Báo cáo lỗi ứng dụng hoặc các vấn đề kỹ thuật.",
            detailContent: (
                <>
                    <h3>1. Ứng dụng bị lag/chậm?</h3>
                    <p>Thử xóa cache trình duyệt hoặc cập nhật ứng dụng lên phiên bản mới nhất.</p>
                    
                    <h3>2. Không tải được ảnh/video?</h3>
                    <p>Kiểm tra kết nối mạng của bạn. Nếu vẫn lỗi, server chứa ảnh có thể đang bảo trì.</p>
                    
                    <h3>3. Liên hệ hỗ trợ kỹ thuật</h3>
                    <p>Gửi email chi tiết về lỗi kèm ảnh chụp màn hình tới: <strong>tech@likagg.com</strong></p>
                </>
            )
        }
    };

    // --- 1. RENDER: TRANG HELP CENTER ---
    const renderHelpPage = () => {
        // A. Nếu đang xem chi tiết 1 chủ đề
        if (selectedHelpTopic) {
            const topic = helpTopicsData[selectedHelpTopic];
            return (
                <div className="static-page-wrapper">
                    {/* Header nhỏ */}
                    <div className="help-hero" style={{padding: '40px 20px', minHeight: 'auto'}}>
                        <h2 className="help-title" style={{fontSize: '2rem', marginBottom: '0'}}>Trung tâm trợ giúp</h2>
                    </div>

                    <div className="help-container">
                        {/* Nút quay lại */}
                        <button 
                            onClick={() => setSelectedHelpTopic(null)}
                            style={{
                                background: 'transparent', border: 'none', color: '#555', 
                                cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', 
                                display: 'flex', alignItems: 'center', marginBottom: '20px'
                            }}
                        >
                            ← Quay lại danh sách
                        </button>

                        {/* Nội dung chi tiết */}
                        <div className="legal-card topic-detail-card">
                            <div style={{textAlign: 'center', marginBottom: '30px'}}>
                                <div style={{fontSize: '4rem', marginBottom: '10px'}}>{topic.icon}</div>
                                <h1 style={{fontSize: '2.2rem', color: '#1a1a1b'}}>{topic.title}</h1>
                                <p style={{color: '#666', fontSize: '1.1rem'}}>{topic.desc}</p>
                            </div>
                            <hr style={{border: '0', borderTop: '1px solid #eee', margin: '30px 0'}} />
                            <div className="static-content">
                                {topic.detailContent}
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        // B. Nếu đang ở trang danh sách chủ đề (Mặc định)
        return (
            <div className="static-page-wrapper">
                <div className="help-hero">
                    <h1 className="help-title">Chúng tôi có thể giúp gì cho bạn?</h1>
                    <div className="help-search-box">
                        <input 
                            type="text" 
                            className="help-search-input" 
                            placeholder="Tìm kiếm vấn đề (ví dụ: đổi mật khẩu, tạo bài viết...)" 
                        />
                        <span className="help-search-icon">🔍</span>
                    </div>
                </div>

                <div className="help-container">
                    <div className="topic-grid">
                        {Object.values(helpTopicsData).map((topic) => (
                            <div key={topic.id} className="topic-card" onClick={() => setSelectedHelpTopic(topic.id)} style={{cursor: 'pointer'}}>
                                <span className="topic-icon">{topic.icon}</span>
                                <h3>{topic.title}</h3>
                                <p>{topic.desc}</p>
                                <span className="topic-link">Xem chi tiết →</span>
                            </div>
                        ))}
                    </div>
                    
                    <div style={{textAlign: 'center', marginTop: '50px', color: '#666'}}>
                        <p>Vẫn cần trợ giúp? <a href="mailto:support@likagg.com" style={{color:'#0079d3', fontWeight:'bold'}}>Liên hệ trực tiếp</a></p>
                    </div>
                </div>
            </div>
        );
    };

    // --- 2. RENDER: CÁC TRANG PHÁP LÝ KHÁC (Terms, Privacy...) ---
    // (Giữ nguyên phần này như cũ)
    const legalContent = {
        terms: {
            title: "Điều khoản Dịch vụ",
            updated: "10 tháng 1, 2025",
            body: (
                <>
                    <p>Chào mừng bạn đến với Likagg. Bằng việc truy cập hoặc sử dụng dịch vụ của chúng tôi, bạn đồng ý tuân thủ các điều khoản sau đây.</p>
                    <h2>1. Sử dụng Dịch vụ</h2>
                    <p>Bạn chịu trách nhiệm về mọi hoạt động xảy ra dưới tên tài khoản của mình. Bạn đồng ý không sử dụng dịch vụ vào các mục đích bất hợp pháp hoặc bị cấm.</p>
                    <ul>
                        <li>Không mạo danh người khác hoặc tổ chức khác.</li>
                        <li>Không can thiệp hoặc phá hoại hệ thống máy chủ của Likagg.</li>
                        <li>Không thu thập dữ liệu người dùng trái phép.</li>
                    </ul>
                    <h2>2. Nội dung Người dùng</h2>
                    <p>Bạn giữ quyền sở hữu đối với nội dung bạn đăng tải. Tuy nhiên, bằng việc đăng tải, bạn cấp cho Likagg giấy phép không độc quyền để sử dụng, hiển thị và phân phối nội dung đó trên nền tảng.</p>
                    <h2>3. Chấm dứt</h2>
                    <p>Chúng tôi có quyền đình chỉ hoặc khóa tài khoản của bạn nếu bạn vi phạm các Điều khoản này mà không cần báo trước.</p>
                </>
            )
        },
        privacy: {
            title: "Chính sách Bảo mật",
            updated: "15 tháng 1, 2025",
            body: (
                <>
                    <p>Tại Likagg, chúng tôi cam kết bảo vệ quyền riêng tư của bạn. Chính sách này mô tả cách chúng tôi thu thập, sử dụng và chia sẻ thông tin của bạn.</p>
                    <h2>1. Thông tin chúng tôi thu thập</h2>
                    <h3>Thông tin bạn cung cấp</h3>
                    <p>Bao gồm tên người dùng, địa chỉ email, và nội dung bạn tạo ra (bài viết, bình luận, tin nhắn).</p>
                    <h3>Thông tin tự động</h3>
                    <p>Địa chỉ IP, loại thiết bị, và lịch sử tương tác của bạn trên nền tảng để cải thiện trải nghiệm người dùng.</p>
                    <h2>2. Cách chúng tôi sử dụng thông tin</h2>
                    <ul>
                        <li>Cung cấp và duy trì dịch vụ.</li>
                        <li>Phát hiện và ngăn chặn gian lận, spam.</li>
                        <li>Cá nhân hóa nội dung hiển thị cho bạn.</li>
                    </ul>
                    <h2>3. Chia sẻ thông tin</h2>
                    <p>Chúng tôi không bán thông tin cá nhân của bạn. Chúng tôi chỉ chia sẻ dữ liệu khi có yêu cầu pháp lý hoặc để bảo vệ quyền lợi của Likagg.</p>
                </>
            )
        },
        "content-policy": {
            title: "Chính sách Nội dung",
            updated: "01 tháng 1, 2025",
            body: (
                <>
                    <p>Likagg là nơi dành cho mọi người, nhưng không phải cho mọi loại nội dung. Dưới đây là các quy tắc để giữ cho cộng đồng an toàn.</p>
                    <h2>Nghiêm cấm</h2>
                    <ul>
                        <li><strong>Quấy rối & Bắt nạt:</strong> Không được phép tấn công cá nhân, đe dọa hoặc kích động bạo lực.</li>
                        <li><strong>Nội dung khiêu dâm:</strong> Cấm đăng tải hình ảnh nhạy cảm không được phép hoặc nội dung khiêu dâm trẻ em.</li>
                        <li><strong>Thông tin sai lệch:</strong> Cố ý lan truyền tin giả gây hại đến sức khỏe cộng đồng hoặc an ninh.</li>
                    </ul>
                    <h2>Thực thi</h2>
                    <p>Chúng tôi sử dụng kết hợp công nghệ tự động và đội ngũ kiểm duyệt để xử lý vi phạm. Các hình phạt bao gồm xóa nội dung, hạn chế tài khoản hoặc cấm vĩnh viễn.</p>
                </>
            )
        },
        "user-agreement": {
            title: "Thỏa thuận Người dùng",
            updated: "05 tháng 2, 2025",
            body: (
                <>
                    <p>Đây là thỏa thuận pháp lý giữa bạn và Likagg Inc. liên quan đến việc sử dụng các sản phẩm và dịch vụ của chúng tôi.</p>
                    <h2>1. Chấp thuận</h2>
                    <p>Việc bạn đăng ký tài khoản đồng nghĩa với việc bạn đã đọc, hiểu và đồng ý với thỏa thuận này.</p>
                    <h2>2. Giới hạn trách nhiệm</h2>
                    <p>Likagg không chịu trách nhiệm về bất kỳ thiệt hại gián tiếp, ngẫu nhiên hoặc trừng phạt nào phát sinh từ việc bạn sử dụng dịch vụ.</p>
                </>
            )
        }
    };

    const renderLegalPage = (key) => {
        const data = legalContent[key] || { title: "Trang không tồn tại", body: "Nội dung đang cập nhật." };
        return (
            <div className="static-page-wrapper">
                <div className="legal-header">
                    <h1>{data.title}</h1>
                    {data.updated && <p className="legal-date">Cập nhật lần cuối: {data.updated}</p>}
                </div>
                <div className="legal-content-container">
                    <div className="legal-card">
                        {data.body}
                    </div>
                </div>
            </div>
        );
    };

    // --- MAIN RENDER ---
    if (type === 'help') {
        return renderHelpPage();
    } else {
        return renderLegalPage(type);
    }
};

export default InfoPage;