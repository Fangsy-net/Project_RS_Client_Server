const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    // Mengambil token dari header HTTP 'Authorization'
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer <token>"

    // Jika tidak ada token, kunci akses langsung (401 Unauthorized)
    if (!token) {
        return res.status(401).json({ message: 'Akses ditolak! Token tidak disediakan.' });
    }

    try {
        // Verifikasi kecocokan token dengan secret key kita
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; // Masukkan data payload token ke dalam objek request
        next(); // Lolos, silahkan lanjut ke controller utama
    } catch (error) {
        res.status(403).json({ message: 'Token tidak valid atau sudah kedaluwarsa!' });
    }
};

module.exports = verifyToken;