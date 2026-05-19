const express = require('express');
const router = express.Router();
const RekamMedis = require('../models/RekamMedis');
const Pasien = require('../models/Pasien');
const Dokter = require('../models/Dokter');
const grantAccess = require('../middleware/roleMiddleware');

// 1. CREATE: Menambah Catatan Rekam Medis Baru
router.post('/', grantAccess('resepsionis'), async (req, res) => {
    try {
        // Pastikan pasien_id dan dokter_id yang dimasukkan memang ada di database
        const pasienExist = await Pasien.findByPk(req.body.pasienId);
        const dokterExist = await Dokter.findByPk(req.body.dokterId);

        if (!pasienExist || !dokterExist) {
            return res.status(400).json({ message: 'ID Pasien atau ID Dokter tidak valid!' });
        }

        const rmBaru = await RekamMedis.create(req.body);
        res.status(201).json({ message: 'Rekam medis berhasil dicatat!', data: rmBaru });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. READ ALL: Mengambil Semua Rekam Medis Beserta Info Pasien & Dokter (Eager Loading)
router.get('/', grantAccess('resepsionis'), async (req, res) => {
    try {
        const semuaRM = await RekamMedis.findAll({
            include: [
                { model: Pasien, attributes: ['nik', 'namaPasien', 'tanggalLahir'] },
                { model: Dokter, attributes: ['namaDokter', 'spesialisasi'] }
            ]
        });
        res.status(200).json(semuaRM);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;