import express from 'express';
import db from '../db.js';
import authMiddleware from '../middleware/authMiddleware.js';
import multer from 'multer';
import path from 'path';
import jwt from 'jsonwebtoken'; 

const router = express.Router();
const JWT_SECRET = 'qqe@123456'; 

// --- CẤU HÌNH MULTER (UPLOAD ẢNH) ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Chỉ được upload file ảnh!'), false);
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

// --- THUẬT TOÁN: XÂY DỰNG CÂY BÌNH LUẬN (RECURSIVE) ---
const buildCommentTree = (comments) => {
    const commentMap = {};
    const commentTree = [];

    comments.forEach(comment => {
        commentMap[comment.id] = { ...comment, children: [] };
    });

    comments.forEach(originalComment => {
        const comment = commentMap[originalComment.id];
        if (comment.parent_comment_id) {
            if (commentMap[comment.parent_comment_id]) {
                commentMap[comment.parent_comment_id].children.push(comment);
            }
        } else {
            commentTree.push(comment);
        }
    });

    return commentTree;
};

// ... (API GET / - Lấy danh sách bài đăng giữ nguyên) ...
router.get('/', async (req, res) => {
    try {
        const { community, sort, search } = req.query;
        let orderByClause = 'p.created_at DESC'; 
        
        if (sort === 'popular') {
            orderByClause = `(COALESCE(SUM(v.direction), 0) + (SELECT COUNT(*) FROM Comments c WHERE c.post_id = p.id) + (UNIX_TIMESTAMP(p.created_at) / 450000)) DESC`;
        } else if (sort === 'top') {
            orderByClause = `score DESC`;
        }

        let sql = `
            SELECT p.id, p.title, p.url, p.text_content, p.created_at, p.community, u.username,
            COALESCE(SUM(v.direction), 0) as score,
            (SELECT COUNT(*) FROM Comments c WHERE c.post_id = p.id) as comment_count
            FROM Posts p
            JOIN Users u ON p.user_id = u.id
            LEFT JOIN Post_Votes v ON p.id = v.post_id
        `;
        
        const params = [];
        const whereConditions = [];

        if (community) {
            whereConditions.push(`p.community = ?`);
            params.push(community);
        }
        if (search) {
            whereConditions.push(`(p.title LIKE ? OR p.text_content LIKE ?)`);
            params.push(`%${search}%`, `%${search}%`);
        }

        if (whereConditions.length > 0) {
            sql += ` WHERE ` + whereConditions.join(' AND ');
        }

        sql += ` GROUP BY p.id ORDER BY ${orderByClause}`;

        const [rows] = await db.execute(sql, params);
        res.json(rows);

    } catch (error) {
        console.error('Lỗi lấy bài đăng:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// ============================================================
// API GET: CHI TIẾT BÀI ĐĂNG (KÈM TREE COMMENTS)
// ============================================================
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const [postRows] = await db.execute(
            `SELECT p.id, p.title, p.url, p.text_content, p.created_at, p.community, u.username,
             COALESCE(SUM(v.direction), 0) as score
             FROM Posts p
             JOIN Users u ON p.user_id = u.id
             LEFT JOIN Post_Votes v ON p.id = v.post_id
             WHERE p.id = ?
             GROUP BY p.id`,
            [id]
        );

        if (postRows.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy bài đăng' });
        }

        // [SỬA] Thêm u.avatar_url vào câu SELECT
        const [commentRows] = await db.execute(
            `SELECT c.id, c.content, c.created_at, u.username, u.avatar_url, c.parent_comment_id
             FROM Comments c
             JOIN Users u ON c.user_id = u.id
             WHERE c.post_id = ?
             ORDER BY c.created_at ASC`,
            [id]
        );

        const nestedComments = buildCommentTree(commentRows);

        res.json({ post: postRows[0], comments: nestedComments });

    } catch (error) {
        console.error('Lỗi lấy chi tiết bài đăng:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// ... (API POST Vote giữ nguyên) ...
router.post('/:id/vote', authMiddleware, async (req, res) => {
    try {
        const { id: postId } = req.params;
        const { direction } = req.body; 
        const userId = req.user.userId;

        const [existingVote] = await db.execute(
            'SELECT * FROM Post_Votes WHERE user_id = ? AND post_id = ?',
            [userId, postId]
        );

        if (existingVote.length > 0) {
            if (direction === 0) {
                await db.execute('DELETE FROM Post_Votes WHERE user_id = ? AND post_id = ?', [userId, postId]);
            } else if (existingVote[0].direction !== direction) {
                await db.execute('UPDATE Post_Votes SET direction = ? WHERE user_id = ? AND post_id = ?', [direction, userId, postId]);
            }
        } else {
            if (direction !== 0) {
                await db.execute('INSERT INTO Post_Votes (user_id, post_id, direction) VALUES (?, ?, ?)', [userId, postId, direction]);
            }
        }

        const [scoreResult] = await db.execute(
            'SELECT COALESCE(SUM(direction), 0) as score FROM Post_Votes WHERE post_id = ?',
            [postId]
        );

        res.json({ score: scoreResult[0].score });

    } catch (error) {
        console.error('Lỗi vote:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// ============================================================
// API POST: BÌNH LUẬN
// ============================================================
router.post('/:id/comments', authMiddleware, async (req, res) => {
    try {
        const { id: postId } = req.params;
        const { content, parent_comment_id } = req.body;
        const userId = req.user.userId;

        if (!content) return res.status(400).json({ message: 'Nội dung bắt buộc' });

        const [result] = await db.execute(
            'INSERT INTO Comments (content, user_id, post_id, parent_comment_id) VALUES (?, ?, ?, ?)',
            [content, userId, postId, parent_comment_id || null]
        );

        // [SỬA] Thêm u.avatar_url vào câu SELECT trả về
        const [newCommentRows] = await db.execute(
             `SELECT c.id, c.content, c.created_at, u.username, u.avatar_url, c.parent_comment_id
              FROM Comments c
              JOIN Users u ON c.user_id = u.id
              WHERE c.id = ?`,
            [result.insertId]
        );
        
        res.status(201).json(newCommentRows[0]);
    } catch (error) {
        console.error('Lỗi comment:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// ... (API POST Tạo bài đăng giữ nguyên) ...
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
    try {
        const { title, url, text_content, community } = req.body;
        const userId = req.user.userId;
        const username = req.user.username; 

        if (!title) return res.status(400).json({ message: 'Tiêu đề là bắt buộc' });

        let finalUrl = url || null;
        if (req.file) {
            finalUrl = `http://localhost:5001/uploads/${req.file.filename}`;
        }

        const selectedCommunity = community || 'r/general';

        const [result] = await db.execute(
            'INSERT INTO Posts (title, url, text_content, user_id, community) VALUES (?, ?, ?, ?, ?)',
            [title, finalUrl, text_content || null, userId, selectedCommunity]
        );
        
        const newPostId = result.insertId;

        const [followers] = await db.execute(
            'SELECT follower_id FROM Follows WHERE following_id = ?',
            [userId]
        );

        if (followers.length > 0) {
            const notifMsg = `${username} vừa đăng bài mới trong ${selectedCommunity}: "${title}"`;
            const values = followers.map(f => [f.follower_id, userId, 'new_post', newPostId, notifMsg]);
            await db.query(
                'INSERT INTO Notifications (user_id, actor_id, type, reference_id, message) VALUES ?',
                [values]
            );
        }

        const [newPostRows] = await db.execute(
            `SELECT p.id, p.title, p.url, p.text_content, p.created_at, p.community, u.username, 0 as score 
             FROM Posts p
             JOIN Users u ON p.user_id = u.id
             WHERE p.id = ?`,
            [newPostId]
        );
        
        res.status(201).json(newPostRows[0]);

    } catch (error) {
        console.error('Lỗi tạo bài:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

export default router;