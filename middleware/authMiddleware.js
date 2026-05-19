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

        const token = parts[1];

        // Verifikasi menggunakan JWT_SECRET dari .env
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; // Simpan data user (id, role) ke objek request
        
        return next(); // Loloskan ke rute berikutnya (Misal ke pasienRoutes)

    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(403).json({ message: 'Token tidak valid atau sudah kedaluwarsa!' });
        }
        return res.status(500).json({ error: error.message });
    }
};

module.exports = verifyToken;