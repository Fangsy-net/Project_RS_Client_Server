const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // Atau 'bcrypt' sesuai yang lu install
const User = require('../models/User'); // Pastikan path model User bener

// 1. ROUTE REGISTER USER BARU
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, role, dokterId } = req.body;

        // Cek apakah username sudah dipakai
        const userExists = await User.findOne({ where: { username } });
        if (userExists) {
            return res.status(400).json({ message: 'Username sudah terdaftar!' });
        }

        // Cek apakah email sudah dipakai
        const emailExists = await User.findOne({ where: { email } });
        if (emailExists) {
            return res.status(400).json({ message: 'Email sudah terdaftar!' });
        }

        // Hash password sebelum disimpan ke MySQL
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Simpan user baru ke database
        const userBaru = await User.create({
            username,
            email,
            password: hashedPassword,
            role: role,
            dokterId: dokterId || null
        });

        return res.status(201).json({ 
            message: 'User berhasil didaftarkan!', 
            userId: userBaru.id 
        });

    } catch (error) {
        console.error("ERROR REGISTER:", error);
        return res.status(500).json({ message: error.message });
    }
});

// 2. ROUTE LOGIN
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Cari user berdasarkan username
        const user = await User.findOne({ where: { username } });
        if (!user) {
            return res.status(404).json({ message: 'Username tidak ditemukan!' });
        }

        // Cek password cocok atau kagak
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Password salah!' });
        }

        // Generate Token JWT (Bawa id, role, dan dokterId ke front-end)
        const token = jwt.sign(
            { id: user.id, role: user.role, dokterId: user.dokterId },
            process.env.JWT_SECRET || 'manchesterunitedtreblewinnerinsyaallah',
            { expiresIn: '24h' }
        );

        // Kembalikan token beserta data user dasar
        return res.status(200).json({
            message: 'Login berhasil!',
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        });

    } catch (error) {
        console.error("ERROR LOGIN:", error);
        return res.status(500).json({ message: error.message });
    }
});

module.exports = router;