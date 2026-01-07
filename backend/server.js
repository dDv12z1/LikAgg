import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from './db.js';
import postRoutes from './routes/postRoutes.js'; 
import communityRoutes from './routes/communityRoutes.js'; 
import userRoutes from './routes/userRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer'; 
import shortRoutes from './routes/shortRoutes.js'; // <--- Thêm dòng này

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const corsOptions = {
    origin: 'http://localhost:3000' 
};
app.use(cors(corsOptions));
app.use(express.json()); 

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const JWT_SECRET = 'qqe@123456'; 

const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'ethereal.user@ethereal.email', 
        pass: 'ethereal_pass' 
    }
});

// --- API AUTH ---
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !password || !email) return res.status(400).json({ message: 'Please, enter all fields!'})
        
        const [existingUsers] = await db.execute('SELECT * FROM Users WHERE email = ? OR username = ?', [email, username]);
        if (existingUsers.length > 0) return res.status(400).json({ message: 'Email or username already exists'});
        
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        
        // 1. Tạo User mới
        const [result] = await db.execute('INSERT INTO Users (username, email, password_hash) VALUES (?, ?, ?)', [username, email, hash]);
        const newUserId = result.insertId;

        // 2. Tự động Join 'r/general' (LOGIC MỚI)
        // Tìm ID của cộng đồng 'general'
        const [generalComm] = await db.execute("SELECT id FROM Communities WHERE name = 'general'");
        
        if (generalComm.length > 0) {
            const generalId = generalComm[0].id;
            // Thêm vào bảng Community_Members
            await db.execute('INSERT INTO Community_Members (user_id, community_id) VALUES (?, ?)', [newUserId, generalId]);
        }

        res.status(201).json({ message: 'User registered successfully'});
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Server Error!'});
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password} = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Please, Enter all fields'});
        const [rows] = await db.execute('SELECT * FROM Users WHERE email = ?', [email]);
        if (rows.length === 0) return res.status(404).json({ message: 'User not found'})
        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(400).json({ message: 'Incorrect password or email'})
        
        const tokenPayload = { userId: user.id, username: user.username }
        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1h'});
        res.json({ token });
    } catch (error) {
        console.error('Login:', error);
        res.status(500).json({ message: 'Server Error!'})
    }
});

app.post('/api/auth/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Vui lòng nhập email.' });
        const [users] = await db.execute('SELECT * FROM Users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(404).json({ message: 'Email không tồn tại.' });
        
        const newPassword = Math.random().toString(36).slice(-8); 
        const salt = await bcrypt.genSalt(10);
        const newHash = await bcrypt.hash(newPassword, salt);
        await db.execute('UPDATE Users SET password_hash = ? WHERE id = ?', [newHash, users[0].id]);
        
        console.log(`>>> MẬT KHẨU MỚI CHO ${email} LÀ: ${newPassword}`);
        res.json({ message: 'Mật khẩu mới đã được gửi (check console).' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server.' });
    }
});

// --- ĐĂNG KÝ ROUTE ---
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/communities', communityRoutes); 
app.use('/api/shorts', shortRoutes); // <--- Thêm dòng này

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Backend đang chạy trên cổng ${PORT} (với ES Modules)`));