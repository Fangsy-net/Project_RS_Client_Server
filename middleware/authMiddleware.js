const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return res.status(401).json({ message: 'Akses ditolak! Token tidak disediakan.' });
        }

        // Ambil token dari format "Bearer <token>"
        const parts = authHeader.trim().split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return res.status(401).json({ message: 'Format token salah! Harus "Bearer <token>"' });
        }

        const token = parts[1]; // CUKUP DEKLARASI SEKALI DI SINI, MEK!

        // Verifikasi menggunakan JWT_SECRET dari .env
        const verified = jwt.verify(token, process.env.JWT_SECRET || 'manchesterunitedtreblewinnerinsyaallah');
        
        // Simpan data user (id, role, dll) ke objek request
        req.user = verified; 
        
        return next(); // Loloskan ke rute berikutnya

    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(403).json({ message: 'Token tidak valid atau sudah kedaluwarsa!' });
        }
        return res.status(500).json({ message: error.message });
    }
};

module.exports = verifyToken;