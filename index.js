const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');

// Import model agar relasi tereksekusi oleh Sequelize
const User = require('./models/User');
const Dokter = require('./models/Dokter');
const Pasien = require('./models/Pasien');
const RekamMedis = require('./models/RekamMedis');
const JadwalDokter = require('./models/JadwalDokter');

//routes
const authRoutes = require('./routes/authRoutes');
const pasienRoutes = require('./routes/pasienRoutes');
const rekamMedisRoutes = require('./routes/rekamMedisRoutes');
const dokterRoutes = require('./routes/dokterRoutes');
const transaksiRoutes = require('./routes/transaksiRoutes');
const jadwalRoutes = require('./routes/jadwalRoutes');

Pasien.belongsTo(Dokter, { foreignKey: 'dokterId' });
Dokter.hasMany(Pasien, { foreignKey: 'dokterId' });
RekamMedis.belongsTo(Pasien, { foreignKey: 'pasienId' });
RekamMedis.belongsTo(Dokter, { foreignKey: 'dokterId' });
JadwalDokter.belongsTo(Dokter, { foreignKey: 'dokterId', as: 'dokter' });
Dokter.hasMany(JadwalDokter, { foreignKey: 'dokterId', as: 'jadwal' });   


const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/pasien', pasienRoutes);
app.use('/api/rekam-medis', rekamMedisRoutes);
app.use('/api/dokter', dokterRoutes);
app.use('/api/transaksi', transaksiRoutes);
app.use('/api/jadwal', jadwalRoutes);
const PORT = process.env.PORT || 3000;

// Sinkronisasi Database & Jalankan Server
// Menggunakan { force: true } agar Sequelize menyesuaikan struktur dan menghapus tabel lama
sequelize.sync({ alter: false })
    .then(() => {
        console.log('Database terhubung & sinkronisasi model berhasil.');
        app.listen(PORT, () => console.log(`Server berjalan di http://localhost:${PORT}`));
    })
    .catch(err => {
        console.error('Gagal sinkronisasi database:', err);
    });