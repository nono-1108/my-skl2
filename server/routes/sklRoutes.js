const express = require('express');
const router = express.Router();

const { getAllSkl, createSkl, cetakSkl, deleteSkl, updateSkl } = require('../controllers/sklController');

router.get('/', getAllSkl);
router.post('/', createSkl); 
router.get('/cetak/:id', cetakSkl);
router.delete('/:id', deleteSkl);
router.put('/:id', updateSkl);

module.exports = router;