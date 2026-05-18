const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');

// Import model agar relasi tereksekusi oleh Sequelize
const User = require('./models/User');
const Dokter = require('./models/Dokter');
const Pasien = require('./models/Pasien');
const RekamMedis = require('./models/RekamMedis');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Sinkronisasi Database & Jalankan Server
// Menggunakan { alter: true } agar Sequelize menyesuaikan struktur tanpa menghapus data dummy yang sudah kamu isi di HeidiSQL
sequelize.sync({ force: true })
    .then(() => {
        console.log('Database terhubung & sinkronisasi model berhasil.');
        app.listen(PORT, () => console.log(`Server berjalan di http://localhost:${PORT}`));
    })
    .catch(err => {
        console.error('Gagal sinkronisasi database:', err);
    });