const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

const { getAllSkl, createSkl, cetakSkl, deleteSkl, updateSkl, loginAdmin } = require('../controllers/sklController');

// Rute Publik
router.post('/login', loginAdmin);
router.get('/', getAllSkl);
router.get('/cetak/:id', cetakSkl);

// Rute Terlindungi (Membutuhkan Token)
router.post('/', authMiddleware, createSkl); 
router.delete('/:id', authMiddleware, deleteSkl);
router.put('/:id', authMiddleware, updateSkl);

module.exports = router;