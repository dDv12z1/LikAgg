import mysql from 'mysql2/promise'; 

const pool = mysql.createPool({ 
  host: 'localhost',
  port: 3110,
  user: 'root',
  password: 'qqe@123456', 
  database: 'likagg',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

console.log("Đã tạo Pool kết nối đến MySQL!");

export default pool;