const express = require('express');
const router = express.Router();
const JadwalDokter = require('../models/JadwalDokter');
const Dokter = require('../models/Dokter');
const verifyToken = require('../middleware/authMiddleware');

// 1. GET ALL JADWAL DOKTER (Bisa dilihat Resepsionis & Dokter)
router.get('/' , verifyToken, async (req, res) => {
    try {
        const daftarJadwal = await JadwalDokter.findAll({
            include: [{ model: Dokter, as: 'dokter', attributes: ['namaDokter', 'spesialisasi'] }]
        });
        return res.status(200).json(daftarJadwal);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// 2. POST - TAMBAH JADWAL BARU (Hanya Resepsionis)
router.post('/', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'resepsionis') {
            return res.status(403).json({ message: 'Forbidden: Hanya Resepsionis yang bisa mengatur jadwal!' });
        }

        const { dokterId, hari, jamMulai, jamSelesai, status } = req.body;

        if (!dokterId || !hari || !jamMulai || !jamSelesai) {
            return res.status(400).json({ message: 'Semua data jadwal wajib diisi, Tot!' });
        }

        const jadwalBaru = await JadwalDokter.create({ dokterId, hari, jamMulai, jamSelesai, status });
        return res.status(201).json({ message: 'Jadwal dokter berhasil ditambahkan!', data: jadwalBaru });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// 3. PUT - UPDATE JADWAL (Hanya Resepsionis)
router.put('/:id', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'resepsionis') {
            return res.status(403).json({ message: 'Forbidden: Hak akses ditolak!' });
        }
        const { id } = req.params;
        const [updated] = await JadwalDokter.update(req.body, { where: { id } });
        
        if (updated === 0) return res.status(404).json({ message: 'Jadwal tidak ditemukan atau tidak ada perubahan.' });
        
        const jadwalUpdate = await JadwalDokter.findByPk(id);
        return res.status(200).json({ message: 'Jadwal berhasil diperbarui!', data: jadwalUpdate });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// 4. DELETE - HAPUS JADWAL (Hanya Resepsionis)
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'resepsionis') {
            return res.status(403).json({ message: 'Forbidden: Hak akses ditolak!' });
        }
        const { id } = req.params;
        const deleted = await JadwalDokter.destroy({ where: { id } });
        
        if (!deleted) return res.status(404).json({ message: 'Jadwal tidak ditemukan!' });
        return res.status(200).json({ message: 'Jadwal dokter berhasil dihapus!' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

module.exports = router;