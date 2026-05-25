const express = require('express');
const router = express.Router();
const RekamMedis = require('../models/RekamMedis');
const Pasien = require('../models/Pasien');
const Dokter = require('../models/Dokter');
const verifyToken = require('../middleware/authMiddleware');
const grantAccess = require('../middleware/roleMiddleware');

// =========================================================================
// 1. CREATE: Menambah Catatan Rekam Medis Baru
// =========================================================================
router.post('/', verifyToken, grantAccess('resepsionis', 'dokter'), async (req, res) => {
    try {
        // Pastikan pasien_id dan dokter_id yang dimasukkan memang ada di database
        const pasienExist = await Pasien.findByPk(req.body.pasienId);
        const dokterExist = await Dokter.findByPk(req.body.dokterId);

        if (!pasienExist || !dokterExist) {
            return res.status(400).json({ message: 'ID Pasien atau ID Dokter tidak valid!' });
        }

        const rmBaru = await RekamMedis.create(req.body);
        return res.status(201).json({ message: 'Rekam medis berhasil dicatat!', data: rmBaru });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// =========================================================================
// 2. READ ALL: Mengambil Semua Rekam Medis Beserta Info Pasien & Dokter
// =========================================================================
router.get('/', verifyToken, grantAccess('resepsionis', 'dokter'), async (req, res) => {
    try {
        const semuaRM = await RekamMedis.findAll({
            include: [
                { model: Pasien, attributes: ['nik', 'namaPasien', 'tanggalLahir'] },
                { model: Dokter, attributes: ['namaDokter', 'spesialisasi'] }
            ]
        });
        return res.status(200).json(semuaRM);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// =========================================================================
// 3. READ BY ID: Mengambil Rekam Medis Berdasarkan ID
// =========================================================================
router.get('/:id', verifyToken, grantAccess('resepsionis', 'dokter'), async (req, res) => {
    try {
        const { id } = req.params;
        const rm = await RekamMedis.findByPk(id, {
            include: [
                { model: Pasien, attributes: ['nik', 'namaPasien', 'tanggalLahir', 'alamat'] },
                { model: Dokter, attributes: ['namaDokter', 'spesialisasi'] }
            ]
        });

        if (!rm) {
            return res.status(404).json({ message: 'Rekam medis tidak ditemukan!' });
        }

        return res.status(200).json(rm);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// =========================================================================
// 4. UPDATE: Memperbarui Catatan Rekam Medis
// =========================================================================
router.put('/:id', verifyToken, grantAccess('dokter'), async (req, res) => {
    try {
        const { id } = req.params;
        const [updated] = await RekamMedis.update(req.body, { where: { id } });

        if (updated === 0) {
            return res.status(404).json({ message: 'Rekam medis tidak ditemukan atau tidak ada perubahan!' });
        }

        const rmTerupdate = await RekamMedis.findByPk(id, {
            include: [
                { model: Pasien, attributes: ['nik', 'namaPasien'] },
                { model: Dokter, attributes: ['namaDokter', 'spesialisasi'] }
            ]
        });

        return res.status(200).json({ message: 'Rekam medis berhasil diperbarui!', data: rmTerupdate });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// =========================================================================
// 5. DELETE: Menghapus Catatan Rekam Medis
// =========================================================================
router.delete('/:id', verifyToken, grantAccess('resepsionis'), async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await RekamMedis.destroy({ where: { id } });

        if (!deleted) {
            return res.status(404).json({ message: 'Rekam medis tidak ditemukan!' });
        }

        return res.status(200).json({ message: 'Rekam medis berhasil dihapus dari sistem!' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

module.exports = router;