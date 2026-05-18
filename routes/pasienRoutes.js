const express = require('express');
const router = express.Router();
const Pasien = require('../models/Pasien');
const { Op } = require('sequelize');

// 1. CREATE: Menambah Pasien Baru
router.post('/', async (req, res) => {
    try {
        const pasien_baru = await Pasien.create(req.body);
        res.status(201).json({ message: 'Data pasien berhasil disimpan!', data: pasien_baru });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. READ ALL + SEARCH: Mengambil Semua Pasien (Bisa difilter lewat query '?search=nama')
router.get('/', async (req, res) => {
    try {
        const { search } = req.query;
        let queryOptions = {};

        if (search) {
            queryOptions.where = {
                namaPasien: { [Op.like]: `%${search}%` }
            };
        }

        const dataPasien = await Pasien.findAll(queryOptions);
        res.status(200).json(dataPasien);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. UPDATE: Mengubah Data Pasien berdasarkan ID
router.put('/:id', async (req, res) => {
    try {
        const pasien_baru = await Pasien.findByPk(req.params.id);
        if (!pasien_baru) return res.status(404).json({ message: 'Pasien tidak ditemukan' });

        await pasien_baru.update(req.body);
        res.status(200).json({ message: 'Data pasien berhasil diperbarui', data: pasien_baru });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4. DELETE: Menghapus Pasien
router.delete('/:id', async (req, res) => {
    try {
        const pasien_baru = await Pasien.findByPk(req.params.id);
        if (!pasien_baru) return res.status(404).json({ message: 'Pasien tidak ditemukan' });

        await pasien_baru.destroy();
        res.status(200).json({ message: 'Data pasien berhasil dihapus dari sistem' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;