import express from 'express';
import db from '../db.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// --- API 1: Lấy danh sách tất cả cộng đồng ---
// GET /api/communities
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT * FROM Communities ORDER BY name ASC'
        );
        res.json(rows);
    } catch (error) {
        console.error('Lỗi lấy danh sách cộng đồng:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// --- API 2: Tạo cộng đồng mới ---
// POST /api/communities
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { name, description, iconColor } = req.body;
        const userId = req.user.userId;

        const nameRegex = /^[a-z0-9_]+$/;
        if (!name || !nameRegex.test(name)) {
            return res.status(400).json({ 
                message: 'Tên cộng đồng không hợp lệ. Chỉ dùng chữ thường, số và gạch dưới (_).' 
            });
        }

        const [existing] = await db.execute('SELECT * FROM Communities WHERE name = ?', [name]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Tên cộng đồng đã tồn tại!' });
        }

        const [result] = await db.execute(
            'INSERT INTO Communities (name, description, creator_id, icon_color) VALUES (?, ?, ?, ?)',
            [name, description || '', userId, iconColor || '#0079d3']
        );

        // Tự động join khi tạo
        await db.execute('INSERT INTO Community_Members (user_id, community_id) VALUES (?, ?)', [userId, result.insertId]);

        res.status(201).json({ 
            id: result.insertId, 
            name, 
            description, 
            icon_color: iconColor 
        });

    } catch (error) {
        console.error('Lỗi tạo cộng đồng:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// --- API 3: JOIN / LEAVE COMMUNITY (Cái bạn đang thiếu) ---
// POST /api/communities/:name/join
router.post('/:name/join', authMiddleware, async (req, res) => {
    try {
        const communityName = req.params.name;
        const userId = req.user.userId;

        // 1. Tìm ID cộng đồng từ tên
        const [comms] = await db.execute('SELECT id FROM Communities WHERE name = ?', [communityName]);
        if (comms.length === 0) return res.status(404).json({ message: 'Không tìm thấy cộng đồng' });
        const communityId = comms[0].id;

        // 2. Kiểm tra đã join chưa
        const [existing] = await db.execute(
            'SELECT * FROM Community_Members WHERE user_id = ? AND community_id = ?',
            [userId, communityId]
        );

        if (existing.length > 0) {
            // Đã join -> Leave (Xóa)
            await db.execute('DELETE FROM Community_Members WHERE user_id = ? AND community_id = ?', [userId, communityId]);
            res.json({ isJoined: false });
        } else {
            // Chưa join -> Insert
            await db.execute('INSERT INTO Community_Members (user_id, community_id) VALUES (?, ?)', [userId, communityId]);
            res.json({ isJoined: true });
        }
    } catch (error) {
        console.error('Lỗi Join:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// --- API 4: CHECK JOIN STATUS (Cái bạn đang thiếu) ---
// GET /api/communities/:name/is-joined
router.get('/:name/is-joined', authMiddleware, async (req, res) => {
    try {
        const communityName = req.params.name;
        const userId = req.user.userId;
        
        const [comms] = await db.execute('SELECT id FROM Communities WHERE name = ?', [communityName]);
        if (comms.length === 0) return res.json({ isJoined: false });
        
        const [existing] = await db.execute(
            'SELECT * FROM Community_Members WHERE user_id = ? AND community_id = ?',
            [userId, comms[0].id]
        );
        res.json({ isJoined: existing.length > 0 });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
});

export default router;