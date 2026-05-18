const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');

const verifyToken = require('./middleware/authMiddleware');

// Import model agar relasi tereksekusi oleh Sequelize
const User = require('./models/User');
const Dokter = require('./models/Dokter');
const Pasien = require('./models/Pasien');
const RekamMedis = require('./models/RekamMedis');

//routes
const authRoutes = require('./routes/authRoutes');
const pasienRoutes = require('./routes/pasienRoutes');
const rekamMedisRoutes = require('./routes/rekamMedisRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/pasien', pasienRoutes);
app.use('/api/rekam-medis', rekamMedisRoutes);
app.use('/api/auth', authRoutes);

app.use('/api/pasien', verifyToken, pasienRoutes);
app.use('/api/rekam-medis', verifyToken, rekamMedisRoutes);

const PORT = process.env.PORT || 3000;

// Sinkronisasi Database & Jalankan Server
// Menggunakan { alter: true } agar Sequelize menyesuaikan struktur tanpa menghapus data dummy yang sudah kamu isi di HeidiSQL
sequelize.sync({ alter: true })
    .then(() => {
        console.log('Database terhubung & sinkronisasi model berhasil.');
        app.listen(PORT, () => console.log(`Server berjalan di http://localhost:${PORT}`));
    })
    .catch(err => {
        console.error('Gagal sinkronisasi database:', err);
    });