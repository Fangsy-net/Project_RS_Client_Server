const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Dokter = require('../models/Dokter');

// 1. REGISTER USER BARU
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, role, namaDokter, spesialisasi, noIzinPraktek } = req.body;

        // Validasi input kosong dasar
        if (!username || !email || !password || !role) {
            return res.status(400).json({ message: 'Semua field utama wajib diisi!' });
        }

        // Kriptografi: Hashing password dengan salt round 10
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Simpan user ke tabel users
        const userBaru = await User.create({
            username,
            email,
            password: hashedPassword, // Menyimpan versi hash
            role
        });

        // Tantangan Tambahan: Jika role-nya dokter, buat juga profilnya di tabel dokter
        if (role === 'dokter') {
            if (!namaDokter || !spesialisasi || !noIzinPraktek) {
                return res.status(400).json({ message: 'Data profil dokter belum lengkap!' });
            }
            await Dokter.create({
                userId: userBaru.id,
                namaDokter,
                spesialisasi,
                noIzinPraktek
            });
        }

        res.status(201).json({ message: 'Registrasi berhasil!', userId: userBaru.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. LOGIN USER
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Cari user berdasarkan email
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'Email atau password salah!' });
        }

        // Bandingkan password inputan dengan password hash di database
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Email atau password salah!' });
        }

        // Ambil data ID dokter jika user tersebut adalah dokter (untuk keperluan RBAC nanti)
        let dokterId = null;
        if (user.role === 'dokter') {
            const profilDokter = await Dokter.findOne({ where: { userId: user.id } });
            if (profilDokter) dokterId = profilDokter.id;
        }

        // Otorisasi: Buat JSON Web Token (JWT) yang berlaku selama 1 hari
        const token = jwt.sign(
            { id: user.id, role: user.role, dokterId: dokterId },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            message: 'Login berhasil!',
            token,
            user: { id: user.id, username: user.username, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;