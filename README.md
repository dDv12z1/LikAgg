# 🚀 LikAgg App - Reddit-like Social Media & Content Aggregator

> **Đồ Án Cơ Sở 2** — Nền tảng mạng xã hội tổng hợp thông tin, chia sẻ bài viết và thảo luận cộng đồng dạng Reddit.

---

## 📌 Giới thiệu dự án

**LikAgg App** (Like & Aggregator) là ứng dụng mạng xã hội tổng hợp nội dung trực tuyến, được lấy cảm hứng từ mô hình hoạt động của **Reddit**. Ứng dụng cho phép người dùng chia sẻ bài viết (văn bản, hình ảnh, đường dẫn liên kết), tạo và tham gia các cộng đồng sở thích (`r/community`), bình luận lồng nhau theo cấu trúc cây (tree comments), cũng như tương tác bài viết thông qua cơ chế Upvote/Downvote.

---

## 🔥 Tính năng chính

### 1. 🔐 Xát thực & Quản lý Người dùng (Authentication & User Management)
- **Đăng ký / Đăng nhập**: Bảo mật mật khẩu với `bcryptjs`, quản lý phiên làm việc bằng `JSON Web Token (JWT)`.
- **Đăng nhập Google OAuth**: Hỗ trợ đăng nhập nhanh bằng tài khoản Google (`@react-oauth/google`).
- **Quên mật khẩu**: Tự động cấp lại mật khẩu ngẫu nhiên qua hệ thống mail (`nodemailer`).
- **Trang cá nhân (Profile)**: 
  - Xem danh sách bài viết đã đăng, thống kê lượt người theo dõi (Followers / Following).
  - Cập nhật Bio và tải lên ảnh đại diện (Avatar).
  - Đổi mật khẩu tài khoản.
- **Theo dõi người dùng (Follow system)**: Theo dõi / Bỏ theo dõi các tác giả khác để nhận thông báo khi có bài viết mới.

### 2. 🏘️ Quản lý Cộng đồng (Communities / Subreddits)
- **Tạo cộng đồng**: Cho phép người dùng khởi tạo các cộng đồng mới (`r/community_name`) với tên, mô tả và màu sắc đại diện tùy chỉnh.
- **Tham gia / Rời cộng đồng**: Tính năng Join/Leave cộng đồng linh hoạt. Tự động tham gia cộng đồng chung `general` khi tạo tài khoản.
- **Xem bài viết theo cộng đồng**: Lọc feed hiển thị bài viết thuộc riêng từng cộng đồng.

### 3. 📝 Đăng bài & Tổng hợp Nội dung (Posts & Aggregation)
- **Đa dạng hình thức bài đăng**: Hỗ trợ đăng bài kèm văn bản, đường dẫn URL hoặc tải lên ảnh trực tiếp (`multer`).
- **Bảng tin (Feed)**:
  - **Mới nhất (New)**: Hiển thị bài viết theo thời gian tạo giảm dần.
  - **Phổ biến (Popular)**: Thuật toán sắp xếp bài viết dựa trên tổng số lượt vote, số bình luận và thời gian.
  - **Top**: Sắp xếp theo điểm vote cao nhất.
  - **Tìm kiếm (Search)**: Tìm kiếm bài viết theo từ khóa tiêu đề hoặc nội dung.

### 4. 💬 Bình luận phân cấp (Nested / Tree Comments)
- Hỗ trợ trả lời bình luận nhiều cấp (Parent-Child Comment Tree).
- Giao diện thảo luận trực quan theo luồng phản hồi lồng nhau.

### 5. ⬆️⬇️ Tương tác & Đánh giá (Voting System)
- Cơ chế **Upvote (+1)** / **Downvote (-1)** hoặc Hủy vote.
- Cập nhật tổng điểm bài viết (Score) theo thời gian thực.

### 6. 🔔 Hệ thống Thông báo (Notifications)
- Nhận thông báo tự động khi:
  - Có người dùng khác bắt đầu theo dõi bạn.
  - Người bạn đang theo dõi xuất bản bài viết mới.

---

## 🛠️ Công nghệ sử dụng (Tech Stack)

### **Frontend**
- **Core**: React 19 (`react`, `react-dom`)
- **Routing**: `react-router-dom` (v7)
- **HTTP Client**: `axios`
- **Authentication**: `jwt-decode`, `@react-oauth/google`
- **Styling**: Vanilla CSS (Reddit-like Theme & Responsive Design)

### **Backend**
- **Runtime**: Node.js (ES Modules syntax)
- **Framework**: Express.js (v5)
- **Database Driver**: `mysql2/promise` (Pool connection)
- **Security & Auth**: `jsonwebtoken`, `bcryptjs`, `cors`
- **File Storage**: `multer` (Lưu trữ ảnh tải lên tại thư mục `/uploads`)
- **Email Service**: `nodemailer`

### **Cơ sở dữ liệu**
- **MySQL Database** (Phiên bản 8.0+)

---

## 📁 Cấu trúc thư mục (Project Structure)

```text
LikAgg App/
├── backend/
│   ├── db.js                   # Cấu hình kết nối MySQL pool
│   ├── server.js               # Khởi chạy Express server & Auth API
│   ├── middleware/
│   │   └── authMiddleware.js   # Middleware xác thực JWT Token
│   ├── routes/
│   │   ├── communityRoutes.js  # API cộng đồng (Tạo, Join/Leave, List)
│   │   ├── postRoutes.js       # API bài viết (Đăng bài, Vote, Comment tree, List)
│   │   └── userRoutes.js       # API trang cá nhân & Follow
│   └── uploads/                # Thư mục lưu trữ hình ảnh tải lên
│
└── frontend/
    ├── public/                 # File tĩnh HTML, Favicon
    └── src/
        ├── components/         # Các Component tái sử dụng (NavBar, PostItem, CommentSection...)
        ├── context/            # Context API (Auth Context)
        ├── css/                # Style CSS cho ứng dụng
        ├── pages/              # Các trang chính (HomePage, UserProfile, CreatePost...)
        ├── App.js              # Router chính
        └── index.js            # Entry point của React
```

---

## 🗄️ Thiết lập Cơ sở dữ liệu (Database Schema)

Tạo cơ sở dữ liệu tên `likagg` trong MySQL và chạy đoạn kịch bản SQL sau để tạo cấu trúc các bảng:

```sql
CREATE DATABASE IF NOT EXISTS likagg CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE likagg;

-- 1. Bảng Người dùng (Users)
CREATE TABLE IF NOT EXISTS Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    bio TEXT NULL,
    avatar_url VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Bảng Cộng đồng (Communities)
CREATE TABLE IF NOT EXISTS Communities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT NULL,
    creator_id INT NOT NULL,
    icon_color VARCHAR(20) DEFAULT '#0079d3',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- 3. Bảng Thành viên Cộng đồng (Community_Members)
CREATE TABLE IF NOT EXISTS Community_Members (
    user_id INT NOT NULL,
    community_id INT NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, community_id),
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (community_id) REFERENCES Communities(id) ON DELETE CASCADE
);

-- 4. Bảng Bài đăng (Posts)
CREATE TABLE IF NOT EXISTS Posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    url VARCHAR(255) NULL,
    text_content TEXT NULL,
    user_id INT NOT NULL,
    community VARCHAR(50) DEFAULT 'r/general',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- 5. Bảng Vote Bài đăng (Post_Votes)
CREATE TABLE IF NOT EXISTS Post_Votes (
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    direction INT NOT NULL CHECK (direction IN (-1, 1)),
    PRIMARY KEY (user_id, post_id),
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES Posts(id) ON DELETE CASCADE
);

-- 6. Bảng Bình luận (Comments)
CREATE TABLE IF NOT EXISTS Comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    content TEXT NOT NULL,
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    parent_comment_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES Posts(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_comment_id) REFERENCES Comments(id) ON DELETE CASCADE
);

-- 7. Bảng Theo dõi (Follows)
CREATE TABLE IF NOT EXISTS Follows (
    follower_id INT NOT NULL,
    following_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (follower_id, following_id),
    FOREIGN KEY (follower_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (following_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- 8. Bảng Thông báo (Notifications)
CREATE TABLE IF NOT EXISTS Notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    actor_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    reference_id INT NULL,
    message TEXT NOT NULL,
    is_read TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (actor_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- Tạo cộng đồng mặc định 'general'
INSERT IGNORE INTO Communities (name, description, creator_id, icon_color) 
VALUES ('general', 'Cộng đồng chung dành cho tất cả thành viên', 1, '#0079d3');
```

---

## ⚡ Hướng dẫn cài đặt & Khởi chạy (Installation & Setup)

### **1. Yêu cầu môi trường**
- **Node.js**: v16.x trở lên
- **MySQL**: v8.0 trở lên

---

### **2. Cấu hình & Khởi chạy Backend**

```bash
# Di chuyển vào thư mục backend
cd backend

# Cài đặt các gói phụ thuộc (Dependencies)
npm install
```

Chỉnh sửa thông tin kết nối MySQL trong file `backend/db.js` phù hợp với máy của bạn:
```javascript
const pool = mysql.createPool({ 
  host: 'localhost',
  port: 3306,             // Cổng kết nối MySQL của bạn (Mặc định 3306 hoặc 3110)
  user: 'root',           // MySQL Username
  password: 'your_password', // MySQL Password
  database: 'likagg',
  waitForConnections: true,
  connectionLimit: 10
});
```

Khởi chạy Server Backend:
```bash
# Chạy ở chế độ xem thay đổi (Development with Nodemon)
npx nodemon server.js

# Hoặc chạy thông thường
node server.js
```
👉 Backend sẽ lắng nghe tại port: `http://localhost:5001`

---

### **3. Cấu hình & Khởi chạy Frontend**

Mở một cửa sổ Terminal mới:

```bash
# Di chuyển vào thư mục frontend
cd frontend

# Cài đặt các gói phụ thuộc (Dependencies)
npm install

# Khởi chạy ứng dụng React
npm start
```
👉 Frontend sẽ khởi chạy tại trang: `http://localhost:3000`

---

## 📡 Danh sách API Endpoint chính (API Documentation)

### **Xác thực (`/api/auth`)**
| Method | Endpoint | Mô tả |
|---|---|---|
| `POST` | `/api/auth/register` | Đăng ký tài khoản mới (Tự động join cộng đồng general) |
| `POST` | `/api/auth/login` | Đăng nhập nhận JWT Token |
| `POST` | `/api/auth/forgot-password` | Yêu cầu cấp lại mật khẩu |

### **Bài đăng (`/api/posts`)**
| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/api/posts?community=&sort=&search=` | Lấy danh sách bài đăng (Lọc theo cộng đồng, sắp xếp, tìm kiếm) |
| `GET` | `/api/posts/:id` | Xem chi tiết bài đăng & danh sách cây bình luận |
| `POST` | `/api/posts` | Tạo bài đăng mới (upload ảnh/URL/văn bản) |
| `POST` | `/api/posts/:id/vote` | Vote bài đăng (+1, -1, 0) |
| `POST` | `/api/posts/:id/comments` | Đăng bình luận (hỗ trợ bình luận lồng nhau) |

### **Cộng đồng (`/api/communities`)**
| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/api/communities` | Lấy danh sách tất cả cộng đồng |
| `POST` | `/api/communities` | Tạo cộng đồng mới |
| `POST` | `/api/communities/:name/join` | Tham gia / Rời khỏi cộng đồng |
| `GET` | `/api/communities/:name/is-joined` | Kiểm tra trạng thái tham gia cộng đồng |

### **Người dùng (`/api/users`)**
| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/api/users/:username` | Lấy thông tin cá nhân, bài đăng & thống kê |
| `PUT` | `/api/users/me` | Cập nhật thông tin cá nhân (Bio, Avatar, Đổi mật khẩu) |
| `POST` | `/api/users/:username/follow` | Theo dõi / Bỏ theo dõi người dùng khác |
| `GET` | `/api/users/:username/is-following` | Kiểm tra trạng thái đang theo dõi |

---

## 📝 Giấy phép (License)
Dự án được phát triển phục vụ cho mục đích học tập trong môn **Đồ Án Cơ Sở 2**.
