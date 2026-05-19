const express = require('express');
const router = express.Router();
const Pasien = require('../models/Pasien'); 
const Dokter = require('../models/Dokter');
const grantAccess = require('../middleware/roleMiddleware');

router.get('/', grantAccess('resepsionis'), async (req, res) => {
    try {
        const dataDokter = await Dokter.findAll();
        return res.status(200).json(dataDokter);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

router.post('/', grantAccess('resepsionis'), async (req, res) => {
    try {
        const dokterBaru = await Dokter.create(req.body);       
        return res.status(201).json({
            message: 'Data dokter berhasil disimpan!',
            data: dokterBaru
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }   
});

router.put('/:id', grantAccess('resepsionis'), async (req, res) => {
    try {
        const { id } = req.params;
        const [updatedRows] = await Dokter.update(req.body, { where: { id } }); 
        
        if (updatedRows === 0) {
            return res.status(404).json({ message: 'Data dokter tidak ditemukan atau tidak ada perubahan!' });
        }   
        const dataTerupdate = await Dokter.findByPk(id);
        return res.status(200).json({
            message: 'Data dokter berhasil diperbarui!',
            data: dataTerupdate
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }   
});

router.delete('/:id', grantAccess('resepsionis'), async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Dokter.destroy({ where: { id } });
        if (!deleted) {
            return res.status(404).json({ message: 'Data dokter tidak ditemukan!' });
        }
        return res.status(200).json({ message: 'Data dokter berhasil dihapus dari sistem!' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

module.exports = router;