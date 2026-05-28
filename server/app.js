const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const sklRoutes = require('./routes/sklRoutes');

const app = express();

// --- KODE YANG DIPERBARUI (CORS) ---
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    // Kita tambahkan izin khusus untuk 'ngrok-skip-browser-warning' di sini:
    allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning']
}));
// -----------------------------------

app.use(express.json({ limit: '10mb' }));

// --- SERVE STATIC FILES ---
// Menyajikan file index.html, login.html, app.js dari folder utama
app.use(express.static(path.join(__dirname, '../')));

app.use('/api/skl', sklRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server berjalan di port ${PORT} dan siap diakses via jaringan lokal`);
});