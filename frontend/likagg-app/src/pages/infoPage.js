import React from 'react';
import '../css/staticPage.css';

const InfoPage = ({ type }) => {
    // Nội dung mẫu (Bạn có thể thay thế bằng nội dung thật sau này)
    const contentMap = {
        help: {
            title: "Trung tâm trợ giúp (Help Center)",
            body: (
                <>
                    <h3>Làm sao để tạo tài khoản?</h3>
                    <p>Nhấn vào nút "Sign Up" ở góc trên bên phải màn hình và điền thông tin email, mật khẩu.</p>
                    <h3>Làm sao để tạo cộng đồng?</h3>
                    <p>Sau khi đăng nhập, bạn có thể truy cập trang "Create Community" từ menu bên trái.</p>
                    <h3>Quên mật khẩu?</h3>
                    <p>Vui lòng liên hệ support@likagg.com để được hỗ trợ khôi phục.</p>
                </>
            )
        },
        terms: {
            title: "Điều khoản dịch vụ (Terms of Service)",
            body: (
                <>
                    <p>Chào mừng bạn đến với Likagg. Khi sử dụng dịch vụ của chúng tôi, bạn đồng ý với các điều khoản sau:</p>
                    <ul>
                        <li>Không đăng tải nội dung vi phạm pháp luật.</li>
                        <li>Không quấy rối, đe dọa người dùng khác.</li>
                        <li>Chúng tôi có quyền khóa tài khoản nếu phát hiện vi phạm.</li>
                    </ul>
                    <p>Cập nhật lần cuối: 2025.</p>
                </>
            )
        },
        privacy: {
            title: "Chính sách bảo mật (Privacy Policy)",
            body: (
                <>
                    <p>Chúng tôi coi trọng quyền riêng tư của bạn. Dữ liệu của bạn được bảo vệ như thế nào?</p>
                    <h3>1. Dữ liệu thu thập</h3>
                    <p>Chúng tôi chỉ thu thập email và tên hiển thị để phục vụ việc đăng nhập.</p>
                    <h3>2. Chia sẻ dữ liệu</h3>
                    <p>Chúng tôi cam kết không bán dữ liệu của bạn cho bên thứ ba.</p>
                </>
            )
        },
        advertise: {
            title: "Quảng cáo (Advertise)",
            body: <p>Liên hệ partners@likagg.com để biết thêm thông tin về đặt banner quảng cáo.</p>
        },
        // Mặc định cho các trang chưa có nội dung
        default: {
            title: "Đang cập nhật...",
            body: <p>Nội dung trang này đang được xây dựng. Vui lòng quay lại sau.</p>
        }
    };

    const data = contentMap[type] || contentMap.default;

    return (
        <div className="static-container">
            <div className="content-card" style={{marginTop: '40px'}}>
                <h1 style={{borderBottom: 'none', color: '#333'}}>{data.title}</h1>
                <hr style={{margin: '20px 0', border: '0', borderTop: '1px solid #eee'}} />
                <div className="static-content">
                    {data.body}
                </div>
            </div>
        </div>
    );
};

export default InfoPage;