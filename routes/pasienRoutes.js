const express = require('express');
const router = express.Router();
const Pasien = require('../models/Pasien'); 
const grantAccess = require('../middleware/roleMiddleware'); // Pastikan path ini benar

// ==========================================
// 1. GET ALL PASIEN (Bisa diakses Admin, Resepsionis, Dokter)
// ==========================================
router.get('/', grantAccess('resepsionis', 'dokter'), async (req, res) => {
    try {
        const { search } = req.query;
        let queryOptions = {};

        // Fitur pencarian berdasarkan nama jika ada query ?search=...
        if (search) {
            const { Op } = require('sequelize');
            queryOptions.where = {
                namaPasien: { [Op.like]: `%${search}%` }
            };
        }

        const dataPasien = await Pasien.findAll(queryOptions);
        return res.status(200).json(dataPasien);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// ==========================================
// 2. POST / CREATE PASIEN (Hanya Admin & Resepsionis)
// ==========================================
router.post('/', grantAccess('resepsionis'), async (req, res) => {
    try {
        const pasienBaru = await Pasien.create(req.body);
        return res.status(201).json({ 
            message: 'Data pasien berhasil disimpan!', 
            data: pasienBaru 
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// ==========================================
// 3. PUT / UPDATE PASIEN (Hanya Admin & Resepsionis)
// ==========================================
router.put('/:id', grantAccess('resepsionis'), async (req, res) => {
    try {
        const { id } = req.params;
        const [updatedRows] = await Pasien.update(req.body, { where: { id } });

        if (updatedRows === 0) {
            return res.status(404).json({ message: 'Data pasien tidak ditemukan atau tidak ada perubahan!' });
        }

        const dataTerupdate = await Pasien.findByPk(id);
        return res.status(200).json({ 
            message: 'Data pasien berhasil diperbarui!', 
            data: dataTerupdate 
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// ==========================================
// 4. DELETE PASIEN (Hanya Admin & Resepsionis)
// ==========================================
router.delete('/:id', grantAccess('resepsionis'), async (req, res) => {
    try {
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