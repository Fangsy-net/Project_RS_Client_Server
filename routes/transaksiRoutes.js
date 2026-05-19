const express = require('express');
const router = express.Router();
const Transaksi = require('../models/Transaksi');
const RekamMedis = require('../models/RekamMedis');
const grantAccess = require('../middleware/roleMiddleware');

// 1. GET ALL TRANSAKSI (Semua role bisa lihat laporan)
router.get('/', async (req, res) => {
    try {
        const dataTransaksi = await Transaksi.findAll({
            include: [{ model: RekamMedis, as: 'rekamMedis' }]
        });
        return res.status(200).json(dataTransaksi);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// 2. POST / CREATE TRANSAKSI (Hanya Admin & Resepsionis/Kasir)
router.post('/', grantAccess('admin', 'resepsionis'), async (req, res) => {
    try {
        const { rekamMedisId, biayaDokter, biayaObat, statusPembayaran } = req.body;

        // Hitung total bayar otomatis biar kasir ga perlu ngitung manual di body json
        const totalBayar = Number(biayaDokter) + Number(biayaObat);

        const transaksiBaru = await Transaksi.create({
            rekamMedisId,
            biayaDokter,
            biayaObat,
            totalBayar,
            statusPembayaran
        });

        return res.status(201).json({ message: 'Transaksi berhasil dicatat!', data: transaksiBaru });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// 3. PUT / UPDATE STATUS (Untuk melunasi pembayaran)
router.put('/:id', grantAccess('admin', 'resepsionis'), async (req, res) => {
    try {
        const { id } = req.params;
        const { statusPembayaran } = req.body;

        const [updated] = await Transaksi.update({ statusPembayaran }, { where: { id } });
        if (updated === 0) return res.status(404).json({ message: 'Transaksi tidak ditemukan atau tidak ada perubahan' });

        return res.status(200).json({ message: 'Status pembayaran berhasil diperbarui!' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

module.exports = router;