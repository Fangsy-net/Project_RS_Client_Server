const grantAccess = (...allowedRoles) => {
    return (req, res, next) => {
        // req.user didapatkan dari middleware verifyToken sebelumnya
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: 'Forbidden: Anda tidak memiliki hak akses untuk aksi ini!' 
            });
        }
        next(); // Lolos, role sesuai
    };
};

module.exports = grantAccess;