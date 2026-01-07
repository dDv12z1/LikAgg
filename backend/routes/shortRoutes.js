import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import db from '../db.js';

const router = express.Router();

// --- 1. Cấu hình đường dẫn lưu trữ ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Đường dẫn: backend/routes/../uploads/shorts -> backend/uploads/shorts
const uploadDir = path.join(__dirname, '../uploads/shorts');

// Kiểm tra và tạo thư mục nếu chưa tồn tại
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// --- 2. Cấu hình Multer (Upload) ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Tên file: short_timestamp_random.mp4
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'short-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    // Chỉ chấp nhận file video
    if (file.mimetype.startsWith('video/')) {
        cb(null, true);
    } else {
        cb(new Error('Sai định dạng! Chỉ chấp nhận video (mp4, mov, v.v.)'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 100 * 1024 * 1024 } // Giới hạn 100MB
});

// ==========================================
// API ROUTES
// ==========================================

// @route   POST /api/shorts
// @desc    Upload video short mới
router.post('/', upload.single('video'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Vui lòng chọn video!' });
        }

        const { caption, userId, title } = req.body;
        
        if (!userId || userId === 'undefined') {
            return res.status(400).json({ message: 'Lỗi xác thực người dùng!' });
        }
        if (!title) {
            return res.status(400).json({ message: 'Vui lòng nhập tiêu đề video!' });
        }

        const videoUrl = `/uploads/shorts/${req.file.filename}`;

        const sql = 'INSERT INTO Shorts (user_id, title, video_url, caption) VALUES (?, ?, ?, ?)';
        await db.execute(sql, [userId, title, videoUrl, caption]);

        res.status(201).json({ message: 'Đăng Short thành công!' });
    } catch (error) {
        console.error("Lỗi upload short:", error);
        res.status(500).json({ message: 'Lỗi Server' });
    }
});

// @route   GET /api/shorts
// @desc    Lấy danh sách Shorts (Kèm Score và Comment Count)
router.get('/', async (req, res) => {
    try {
        // Query tính toán:
        // - score: Tổng Upvote - Tổng Downvote
        // - comment_count: Tổng số bình luận
        const query = `
            SELECT 
                s.*, 
                u.username, 
                u.avatar_url,
                (
                    (SELECT COUNT(*) FROM Short_Votes sv WHERE sv.short_id = s.id AND sv.vote_type = 'up') - 
                    (SELECT COUNT(*) FROM Short_Votes sv WHERE sv.short_id = s.id AND sv.vote_type = 'down')
                ) AS score,
                (SELECT COUNT(*) FROM Short_Comments sc WHERE sc.short_id = s.id) AS comment_count
            FROM Shorts s
            JOIN Users u ON s.user_id = u.id 
            ORDER BY s.created_at DESC
        `;
        const [rows] = await db.execute(query);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi Server' });
    }
});

// @route   GET /api/shorts/popular
// @desc    Lấy danh sách shorts phổ biến (theo views)
router.get('/popular', async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT Shorts.*, Users.username 
            FROM Shorts 
            JOIN Users ON Shorts.user_id = Users.id 
            ORDER BY Shorts.views DESC 
            LIMIT 5
        `);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi Server' });
    }
});

// ==========================================
// TƯƠNG TÁC (VOTE, COMMENT)
// ==========================================

// @route   POST /api/shorts/:id/vote
// @desc    Xử lý Upvote/Downvote/Unvote
router.post('/:id/vote', async (req, res) => {
    try {
        const shortId = req.params.id;
        const { userId, type } = req.body; // type: 'up' hoặc 'down'

        if (!userId) return res.status(401).json({ message: 'Chưa đăng nhập' });

        // 1. Kiểm tra xem user đã vote short này chưa
        const [existing] = await db.execute(
            'SELECT * FROM Short_Votes WHERE user_id = ? AND short_id = ?',
            [userId, shortId]
        );

        if (existing.length > 0) {
            // Đã từng vote
            if (existing[0].vote_type === type) {
                // Nếu bấm lại nút cũ -> Hủy vote (Unvote)
                await db.execute('DELETE FROM Short_Votes WHERE id = ?', [existing[0].id]);
                return res.json({ message: 'Unvoted', action: 'remove' });
            } else {
                // Nếu bấm nút khác -> Cập nhật vote (Ví dụ từ Up sang Down)
                await db.execute('UPDATE Short_Votes SET vote_type = ? WHERE id = ?', [type, existing[0].id]);
                return res.json({ message: 'Vote updated', action: 'update' });
            }
        } else {
            // Chưa vote -> Tạo mới
            await db.execute(
                'INSERT INTO Short_Votes (user_id, short_id, vote_type) VALUES (?, ?, ?)',
                [userId, shortId, type]
            );
            return res.json({ message: 'Voted', action: 'add' });
        }
    } catch (error) {
        console.error("Lỗi Vote:", error);
        res.status(500).json({ message: 'Lỗi Server' });
    }
});

// @route   GET /api/shorts/:id/comments
// @desc    Lấy danh sách bình luận của 1 short
router.get('/:id/comments', async (req, res) => {
    try {
        const shortId = req.params.id;
        // Lấy danh sách bình luận kèm thông tin người dùng
        const [comments] = await db.execute(`
            SELECT sc.*, u.username, u.avatar_url 
            FROM Short_Comments sc
            JOIN Users u ON sc.user_id = u.id 
            WHERE sc.short_id = ? 
            ORDER BY sc.created_at ASC
        `, [shortId]);
        
        // Frontend sẽ tự xử lý việc hiển thị lồng nhau dựa trên parent_id
        res.json(comments);
    } catch (error) {
        console.error("Lỗi lấy comment:", error);
        res.status(500).json({ message: 'Lỗi Server' });
    }
});

// @route   POST /api/shorts/:id/comments
// @desc    Đăng bình luận (hỗ trợ reply)
router.post('/:id/comments', async (req, res) => {
    try {
        const shortId = req.params.id;
        const { userId, content, parentId } = req.body; // parentId dùng cho nested comment

        if (!userId || !content) return res.status(400).json({ message: 'Thiếu thông tin' });

        await db.execute(
            'INSERT INTO Short_Comments (user_id, short_id, content, parent_id) VALUES (?, ?, ?, ?)',
            [userId, shortId, content, parentId || null]
        );
        
        res.status(201).json({ message: 'Comment added' });
    } catch (error) {
        console.error("Lỗi đăng comment:", error);
        res.status(500).json({ message: 'Lỗi Server' });
    }
});

export default router;