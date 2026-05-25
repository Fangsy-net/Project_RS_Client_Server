const express = require('express');
const router = express.Router();
const Dokter = require('../models/Dokter');
const verifyToken = require('../middleware/authMiddleware');

// =========================================================================
// 1. GET ALL DATA DOKTER (Bisa diakses oleh Resepsionis & Dokter)
// =========================================================================
router.get('/', verifyToken, async (req, res) => {
    try {
        const userRole = req.user.role;

        if (userRole !== 'resepsionis' && userRole !== 'dokter') {
            return res.status(403).json({ message: 'Forbidden: Anda tidak memiliki hak akses untuk melihat data dokter!' });
        }

        const daftarDokter = await Dokter.findAll(); 
        return res.status(200).json(daftarDokter);
    } catch (error) {
        return res.status(500).json({ error: error.message }); 
    }
});

// =========================================================================
// 2. GET DOKTER BY ID (Bisa diakses oleh Resepsionis & Dokter)
// =========================================================================
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userRole = req.user.role;

        if (userRole !== 'resepsionis' && userRole !== 'dokter') {
            return res.status(403).json({ message: 'Forbidden: Anda tidak memiliki hak akses!' });
        }

        const dokter = await Dokter.findByPk(id);
        if (!dokter) {
            return res.status(404).json({ message: 'Data dokter tidak ditemukan!' });
        }

        return res.status(200).json(dokter);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// =========================================================================
// 3. POST - TAMBAH DOKTER BARU (Hanya Resepsionis)
// =========================================================================
router.post('/', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'resepsionis') {
            return res.status(403).json({ message: 'Forbidden: Hanya Resepsionis yang dapat menambah data dokter!' });
        }

        const { namaDokter, spesialisasi, noTelp } = req.body;

        if (!namaDokter || !spesialisasi) {
            return res.status(400).json({ message: 'Nama dokter dan spesialisasi wajib diisi!' });
        }

        // Validasi nomor telepon jika disediakan
        if (noTelp && !/^\d+$/.test(noTelp)) {
            return res.status(400).json({ message: 'Nomor telepon harus berupa angka!' });
        }

        // Jalankan perintah insert ke MySQL
        const dokterBaru = await Dokter.create({ 
            namaDokter, 
            spesialisasi, 
            noTelp: noTelp || null 
        });
        
        return res.status(201).json({ 
            message: 'Data dokter berhasil disimpan!', 
            data: dokterBaru 
        });
    } catch (error) {
        return res.status(500).json({ error: error.message }); 
    }
});

// =========================================================================
// 4. PUT - UPDATE DATA DOKTER (Hanya Resepsionis)
// =========================================================================
router.put('/:id', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'resepsionis') {
            return res.status(403).json({ message: 'Forbidden: Hanya Resepsionis yang dapat mengubah data dokter!' });
        }

        const { id } = req.params;

        // Eksekusi update data berdasarkan ID dokter
        const [updatedRows] = await Dokter.update(req.body, { where: { id } });
        
        if (updatedRows === 0) {
            return res.status(404).json({ message: 'Data dokter tidak ditemukan atau tidak ada perubahan data.' });
        }

        // Ambil data terbaru yang udah berhasil di-update
        const dokterTerupdate = await Dokter.findByPk(id);
        return res.status(200).json({ 
            message: 'Data dokter berhasil diperbarui!', 
            data: dokterTerupdate 
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// =========================================================================
// 5. DELETE - HAPUS DOKTER (Hanya Resepsionis)
// =========================================================================
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'resepsionis') {
            return res.status(403).json({ message: 'Forbidden: Hanya Resepsionis yang dapat menghapus data dokter!' });
        }

        const { id } = req.params;

        // Hapus data dari MySQL
        const deleted = await Dokter.destroy({ where: { id } });
        
        if (!deleted) {
            return res.status(404).json({ message: 'Data dokter tidak ditemukan!' });
        }

        return res.status(200).json({ message: 'Data dokter berhasil dihapus dari sistem klinik!' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

module.exports = router;