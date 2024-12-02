const express = require('express');
const router = express.Router();
const { authorize } = require('../middleware/auth');
const { 
    getAllDepartments, 
    getDepartmentById, 
    createDepartment,
    updateDepartment,
    deleteDepartment 
} = require('../controllers/departmentController');

router.get('/', getAllDepartments);
router.post('/id', getDepartmentById);
router.post('/', authorize(['admin']), createDepartment);
router.put('/', authorize(['admin']), updateDepartment);
router.delete('/', authorize(['admin']), deleteDepartment);

module.exports = router;