const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Pasien = require('../models/Pasien');
const Dokter = require('../models/Dokter');
const verifyToken = require('../middleware/authMiddleware'); // Pakai verifyToken MU kita, Tot!

// 1. GET ALL PASIEN (Resepsionis liat semua, Dokter liat yang dia handle)
router.get('/', verifyToken, async (req, res) => {
    try {
        const userRole = req.user.role;
        const dokterId = req.user.dokterId;
        let condition = {};

        if (userRole === 'dokter') {
            condition.dokterId = dokterId;
        } else if (userRole !== 'resepsionis') {
            return res.status(403).json({ message: 'Forbidden: Anda tidak memiliki hak akses untuk aksi ini!' });
        }

        // Variabel penampung diganti 'daftarPasien' biar gak bentrok sama Model Pasien!
        const daftarPasien = await Pasien.findAll({
            where: condition
        });
        return res.status(200).json(daftarPasien);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// 2. GET PASIEN BY ID
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userRole = req.user.role;
        const dokterId = req.user.dokterId;

        const dataPasien = await Pasien.findByPk(id, {
            include: [{ model: Dokter, as: 'dokter', attributes: ['id', 'namaDokter', 'spesialisasi'] }]
        });

        if (!dataPasien) {
            return res.status(404).json({ message: 'Data pasien tidak ditemukan!' });
        }

        // Validasi hak akses dokter
        if (userRole === 'dokter' && dataPasien.dokterId !== dokterId) {
            return res.status(403).json({ message: 'Forbidden: Anda tidak berhak melihat pasien ini!' });
        }

        return res.status(200).json(dataPasien);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// 3. CREATE PASIEN BARU (Hanya Resepsionis)
router.post('/', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'resepsionis') {
            return res.status(403).json({ message: 'Forbidden: Hanya Resepsionis yang dapat menambah pasien!' });
        }

        const { nik, namaPasien, tanggalLahir, jenisKelamin, alamat, noTelp, dokterId } = req.body;

        if (!nik || !namaPasien || !tanggalLahir || !jenisKelamin) {
            return res.status(400).json({ message: 'Field nik, namaPasien, tanggalLahir, dan jenisKelamin wajib diisi.' });
        }

        const existingPasien = await Pasien.findOne({ where: { nik } });
        if (existingPasien) {
            return res.status(400).json({ message: 'NIK pasien sudah terdaftar.' });
        }

        if (dokterId) {
            const dokter = await Dokter.findByPk(dokterId);
            if (!dokter) {
                return res.status(400).json({ message: 'ID dokter tidak valid.' });
            }
        }

        const pasienBaru = await Pasien.create({ nik, namaPasien, tanggalLahir, jenisKelamin, alamat, noTelp, dokterId });
        return res.status(201).json({ message: 'Data pasien berhasil disimpan!', data: pasienBaru });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// 4. UPDATE PASIEN BY ID (Hanya Resepsionis)
router.put('/:id', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'resepsionis') {
            return res.status(403).json({ message: 'Forbidden: Hanya Resepsionis yang dapat mengubah data pasien!' });
        }

        const { id } = req.params;
        const { nik, dokterId } = req.body;

        if (nik) {
            const pasienExisting = await Pasien.findOne({ where: { nik, id: { [Op.ne]: id } } });
            if (pasienExisting) {
                return res.status(400).json({ message: 'NIK pasien sudah digunakan oleh pasien lain.' });
            }
        }

        if (dokterId) {
            const dokter = await Dokter.findByPk(dokterId);
            if (!dokter) {
                return res.status(400).json({ message: 'ID dokter tidak valid.' });
            }
        }

        const [updatedRows] = await Pasien.update(req.body, { where: { id } });
        if (updatedRows === 0) {
            return res.status(404).json({ message: 'Data pasien tidak ditemukan atau tidak ada perubahan.' });
        }

        const pasienTerupdate = await Pasien.findByPk(id, {
            include: [{ model: Dokter, as: 'dokter', attributes: ['id', 'namaDokter', 'spesialisasi'] }]
        });

        return res.status(200).json({ message: 'Data pasien berhasil diperbarui!', data: pasienTerupdate });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// 5. DELETE PASIEN BY ID (Hanya Resepsionis)
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'resepsionis') {
            return res.status(403).json({ message: 'Forbidden: Hanya Resepsionis yang dapat menghapus data pasien!' });
        }

        const { id } = req.params;
        const deleted = await Pasien.destroy({ where: { id } });
        if (!deleted) {
            return res.status(404).json({ message: 'Data pasien tidak ditemukan!' });
        }
        return res.status(200).json({ message: 'Data pasien berhasil dihapus dari sistem!' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

module.exports = router;