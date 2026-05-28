const jwt = require('../utils/jwt');

const authMiddleware = (req, res, next) => {
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
        return res.status(401).json({ status: 'error', message: 'Akses ditolak. Token tidak ditemukan.' });
    }

    // Biasanya header dikirim dalam format: "Bearer <token>"
    const token = authHeader.split(' ')[1];

    if (!token) {
         return res.status(401).json({ status: 'error', message: 'Akses ditolak. Format token tidak valid.' });
    }

    try {
        // Gunakan secret key dari .env, atau default jika belum di-set
        const secret = process.env.JWT_SECRET || 'rahasia_negara_123';
        const decoded = jwt.verify(token, secret);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ status: 'error', message: 'Token tidak valid atau sudah kedaluwarsa.' });
    }
};

module.exports = authMiddleware;
