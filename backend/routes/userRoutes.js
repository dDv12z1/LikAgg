import express from 'express';
import db from '../db.js';
import authMiddleware from '../middleware/authMiddleware.js';
import multer from 'multer';
import path from 'path';
import bcrypt from 'bcryptjs';

const router = express.Router();

// --- Cấu hình Multer (Giữ nguyên) ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, `avatar_${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage });

// ==========================================
// 1. API: LẤY THÔNG TIN USER (GET PROFILE)
// ==========================================
router.get('/:username', async (req, res) => {
    try {
        const { username } = req.params;
        
        // 1. Lấy thông tin User
        const [users] = await db.execute(
            'SELECT id, username, email, created_at, bio, avatar_url as avatar FROM Users WHERE username = ?', 
            [username]
        );

        if (users.length === 0) return res.status(404).json({ message: 'User not found' });
        const user = users[0];

        // 2. Lấy thống kê Follow
        const [followStats] = await db.execute(`
            SELECT 
                (SELECT COUNT(*) FROM Follows WHERE following_id = ?) as followers_count,
                (SELECT COUNT(*) FROM Follows WHERE follower_id = ?) as following_count
            `, [user.id, user.id]);
        
        user.stats = followStats[0];

        // 3. Lấy danh sách bài viết ĐÃ ĐĂNG
        const [posts] = await db.execute(`
            SELECT p.id, p.title, p.url, p.text_content, p.created_at, p.community, 
            COALESCE(SUM(v.direction), 0) as score
            FROM Posts p
            LEFT JOIN Post_Votes v ON p.id = v.post_id
            WHERE p.user_id = ?
            GROUP BY p.id
            ORDER BY p.created_at DESC
        `, [user.id]);

        // 4. Lấy danh sách cộng đồng
        const [communities] = await db.execute(`
            SELECT DISTINCT community FROM Posts WHERE user_id = ?
        `, [user.id]);

        // --- [MỚI] 5. Lấy danh sách bài viết ĐÃ BÌNH LUẬN ---
        // Logic: Lấy các bài post mà user này có ít nhất 1 comment
        const [commentedPosts] = await db.execute(`
            SELECT p.id, p.title, p.url, p.text_content, p.created_at, p.community,
            (SELECT COALESCE(SUM(direction), 0) FROM Post_Votes WHERE post_id = p.id) as score
            FROM Posts p
            JOIN Comments c ON p.id = c.post_id
            WHERE c.user_id = ?
            GROUP BY p.id
            ORDER BY MAX(c.created_at) DESC
        `, [user.id]);

        // Trả về thêm field "comments" chứa danh sách bài viết đã bình luận
        res.json({ user, posts, comments: commentedPosts, communities });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
// --- Copy lại các phần cũ để đảm bảo file hoàn chỉnh ---
router.put('/me', authMiddleware, upload.single('avatar'), async (req, res) => {
    try {
        const userId = req.user.userId;
        const { bio, password, newPassword } = req.body;
        
        let avatarFileName = null;
        if (req.file) {
            avatarFileName = req.file.filename;
        }

        if (bio !== undefined || avatarFileName) {
            let sql = 'UPDATE Users SET ';
            const params = [];
            
            if (bio !== undefined) {
                sql += 'bio = ?, ';
                params.push(bio);
            }
            if (avatarFileName) {
                sql += 'avatar_url = ?, ';
                params.push(avatarFileName);
            }
            
            sql = sql.slice(0, -2);
            sql += ' WHERE id = ?';
            params.push(userId);

            await db.execute(sql, params);
        }

        if (password && newPassword) {
            const [users] = await db.execute('SELECT password_hash FROM Users WHERE id = ?', [userId]);
            const user = users[0];

            const isMatch = await bcrypt.compare(password, user.password_hash);
            if (!isMatch) {
                return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng.' });
            }

            const salt = await bcrypt.genSalt(10);
            const newHash = await bcrypt.hash(newPassword, salt);
            await db.execute('UPDATE Users SET password_hash = ? WHERE id = ?', [newHash, userId]);
        }

        res.json({ message: 'Cập nhật thành công!', avatar: avatarFileName });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

router.get('/:id/followers-list', async (req, res) => {
    try {
        const userId = req.params.id;
        const q = `SELECT u.id, u.username, u.avatar_url as avatar FROM Users u JOIN Follows f ON u.id = f.follower_id WHERE f.following_id = ?`;
        const [data] = await db.execute(q, [userId]);
        res.json(data);
    } catch (error) { res.status(500).json({ message: 'Error' }); }
});

router.get('/:id/following-list', async (req, res) => {
    try {
        const userId = req.params.id;
        const q = `SELECT u.id, u.username, u.avatar_url as avatar FROM Users u JOIN Follows f ON u.id = f.following_id WHERE f.follower_id = ?`;
        const [data] = await db.execute(q, [userId]);
        res.json(data);
    } catch (error) { res.status(500).json({ message: 'Error' }); }
});

router.post('/:username/follow', authMiddleware, async (req, res) => {
    try {
        const targetUsername = req.params.username;
        const followerId = req.user.userId;
        const [targetUsers] = await db.execute('SELECT id FROM Users WHERE username = ?', [targetUsername]);
        if (targetUsers.length === 0) return res.status(404).json({ message: 'User not found' });
        const targetId = targetUsers[0].id;
        if (targetId === followerId) return res.status(400).json({ message: 'Cannot follow yourself' });

        const [existing] = await db.execute('SELECT * FROM Follows WHERE follower_id = ? AND following_id = ?', [followerId, targetId]);
        if (existing.length > 0) {
            await db.execute('DELETE FROM Follows WHERE follower_id = ? AND following_id = ?', [followerId, targetId]);
            res.json({ isFollowing: false });
        } else {
            await db.execute('INSERT INTO Follows (follower_id, following_id) VALUES (?, ?)', [followerId, targetId]);
            await db.execute('INSERT INTO Notifications (user_id, actor_id, type, message) VALUES (?, ?, ?, ?)', [targetId, followerId, 'follow', `${req.user.username} đã theo dõi bạn.`]);
            res.json({ isFollowing: true });
        }
    } catch (error) { res.status(500).json({ message: 'Server error' }); }
});

router.get('/:username/is-following', authMiddleware, async (req, res) => {
    try {
        const targetUsername = req.params.username;
        const followerId = req.user.userId;
        const [targetUsers] = await db.execute('SELECT id FROM Users WHERE username = ?', [targetUsername]);
        if (targetUsers.length === 0) return res.status(404).json({ message: 'User not found' });
        const [existing] = await db.execute('SELECT * FROM Follows WHERE follower_id = ? AND following_id = ?', [followerId, targetUsers[0].id]);
        res.json({ isFollowing: existing.length > 0 });
    } catch (error) { res.status(500).json({ message: 'Server error' }); }
});

export default router;