// Dibuat dan direvisi oleh: Adrinedo dean nugroho 24SA11A148

require('dotenv').config(); 
const express = require('express'); 
const mysql = require('mysql2/promise');
const cors = require('cors'); 
const app = express();

// Konfigurasi CORS agar bisa diakses dari domain Vercel
app.use(cors()); 
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Konfigurasi Pool Koneksi untuk Aiven Cloud
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'defaultdb', 
    port: process.env.DB_PORT || 26592,           
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: {
        rejectUnauthorized: false 
    }
});

// Middleware untuk cek koneksi database saat server start 
pool.getConnection()
    .then(conn => {
        console.log("✅ Berhasil terhubung ke Database Aiven!");
        conn.release();
    })
    .catch(err => {
        console.error("❌ Gagal koneksi database:", err.message);
    });

// API ENDPOINTS

app.post('/api/users', async (req, res) => {
    const { NAME, result, category, answers } = req.body; 
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction(); 

        const [userResult] = await connection.execute(
            'INSERT INTO users (NAME, result, category, DATE) VALUES (?, ?, ?, NOW())',
            [NAME, result, category]
        );
        const userId = userResult.insertId;

        if (answers && answers.length > 0) {
            const answerValues = answers.map(ans => [
                userId, 
                ans.q_id || 0, 
                ans.question || "Pertanyaan tidak terbaca", 
                ans.answer || "Tidak ada jawaban"
            ]);

            await connection.query(
                'INSERT INTO user_answers (user_id, question_id, question_text, selected_option) VALUES ?',
                [answerValues]
            );
        }

        await connection.commit();
        res.status(201).json({ success: true, userId: userId });
    } catch (err) {
        if (connection) await connection.rollback();
        console.error("❌ Error simpan riwayat:", err.message);
        res.status(500).json({ success: false, message: err.message });
    } finally {
        if (connection) connection.release();
    }
});

app.get('/api/user-answers/:userId', async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT question_text, selected_option FROM user_answers WHERE user_id = ?', 
            [req.params.userId]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.delete('/api/users/:id', async (req, res) => {
    try {
        await pool.execute('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.put('/api/questions/:id', async (req, res) => {
    const { TEXT, TYPE } = req.body;
    try {
        await pool.execute(
            'UPDATE questions SET TEXT = ?, TYPE = ? WHERE id = ?',
            [TEXT, TYPE, req.params.id]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/questions', async (req, res) => {
    const { TEXT, TYPE } = req.body; 
    try {
        await pool.execute('INSERT INTO questions (TEXT, TYPE) VALUES (?, ?)', [TEXT, TYPE]);
        res.status(201).json({ success: true });
    } catch (err) { 
        res.status(500).json({ success: false, message: err.message }); 
    }
});

app.get('/api/questions', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM questions ORDER BY id ASC');
        res.json(rows);
    } catch (err) { 
        res.status(500).json({ success: false, message: err.message }); 
    }
});

app.get('/api/users', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM users ORDER BY DATE DESC');
        res.json(rows);
    } catch (err) { 
        res.status(500).json({ success: false, message: err.message }); 
    }
});

app.delete('/api/questions/:id', async (req, res) => {
    try {
        await pool.execute('DELETE FROM questions WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) { 
        res.status(500).json({ success: false, message: err.message }); 
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server Berjalan di Port: ${PORT}`);
});