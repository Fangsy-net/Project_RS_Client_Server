const express = require('express');
const router = express.Router();
const Transaksi = require('../models/Transaksi');
const RekamMedis = require('../models/RekamMedis');
const verifyToken = require('../middleware/authMiddleware');
const grantAccess = require('../middleware/roleMiddleware');

// =========================================================================
// 1. GET ALL TRANSAKSI (Semua role bisa lihat laporan)
// =========================================================================
router.get('/', verifyToken, async (req, res) => {
    try {
        const dataTransaksi = await Transaksi.findAll({
            include: [{ model: RekamMedis, as: 'rekamMedis' }]
        });
        return res.status(200).json(dataTransaksi);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// =========================================================================
// 2. GET TRANSAKSI BY ID
// =========================================================================
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const transaksi = await Transaksi.findByPk(id, {
            include: [{ model: RekamMedis, as: 'rekamMedis' }]
        });

        if (!transaksi) {
            return res.status(404).json({ message: 'Transaksi tidak ditemukan!' });
        }

        return res.status(200).json(transaksi);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// =========================================================================
// 3. POST / CREATE TRANSAKSI (Hanya Admin & Resepsionis/Kasir)
// =========================================================================
router.post('/', verifyToken, grantAccess('admin', 'resepsionis'), async (req, res) => {
    try {
        const { rekamMedisId, biayaDokter, biayaObat, statusPembayaran } = req.body;

        // Validasi field wajib
        if (!rekamMedisId || !biayaDokter || !biayaObat) {
            return res.status(400).json({ 
                message: 'Field rekamMedisId, biayaDokter, dan biayaObat wajib diisi!' 
            });
        }

        // Validasi rekam medis ada
        const rekamMedisExist = await RekamMedis.findByPk(rekamMedisId);
        if (!rekamMedisExist) {
            return res.status(400).json({ message: 'ID Rekam Medis tidak valid!' });
        }

        // Hitung total bayar otomatis biar kasir ga perlu ngitung manual di body json
        const totalBayar = Number(biayaDokter) + Number(biayaObat);

        const transaksiBaru = await Transaksi.create({
            rekamMedisId,
            biayaDokter,
            biayaObat,
            totalBayar,
            statusPembayaran: statusPembayaran || 'Belum Lunas'
        });

        return res.status(201).json({ 
            message: 'Transaksi berhasil dicatat!', 
            data: transaksiBaru 
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// =========================================================================
// 4. PUT / UPDATE STATUS (Untuk melunasi pembayaran)
// =========================================================================
router.put('/:id', verifyToken, grantAccess('admin', 'resepsionis'), async (req, res) => {
    try {
        const { id } = req.params;
        const { statusPembayaran } = req.body;

        // Validasi status yang valid
        if (statusPembayaran && !['Belum Lunas', 'Lunas'].includes(statusPembayaran)) {
            return res.status(400).json({ 
                message: 'Status pembayaran harus "Belum Lunas" atau "Lunas"!' 
            });
        }

        const [updated] = await Transaksi.update({ statusPembayaran }, { where: { id } });
        
        if (updated === 0) {
            return res.status(404).json({ 
                message: 'Transaksi tidak ditemukan atau tidak ada perubahan!' 
            });
        }

        const transaksiTerupdate = await Transaksi.findByPk(id);
        return res.status(200).json({ 
            message: 'Status pembayaran berhasil diperbarui!',
            data: transaksiTerupdate
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// =========================================================================
// 5. DELETE TRANSAKSI (Hanya Admin)
// =========================================================================
router.delete('/:id', verifyToken, grantAccess('admin'), async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Transaksi.destroy({ where: { id } });

        if (!deleted) {
            return res.status(404).json({ message: 'Transaksi tidak ditemukan!' });
        }

        return res.status(200).json({ message: 'Transaksi berhasil dihapus dari sistem!' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

module.exports = router;