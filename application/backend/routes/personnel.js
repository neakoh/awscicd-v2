const express = require('express');
const router = express.Router();
const PersonnelController = require('../controllers/personnelController');
const { authorize } = require('../middleware/auth');

// Get all personnel
router.get('/', PersonnelController.getAll);
router.get('/all', PersonnelController.getAllWithDetails);
router.post('/id', PersonnelController.getById);
router.post('/', authorize(['admin']), PersonnelController.create);
router.put('/', authorize(['admin']), PersonnelController.update);
router.delete('/', authorize(['admin']), PersonnelController.delete);

module.exports = router;