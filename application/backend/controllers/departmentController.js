const DepartmentService = require('../services/departmentService');
const { sanitizeInput } = require('../utils/sanitizer');

exports.getAllDepartments = async (req, res, next) => {
    try {
        const departments = await DepartmentService.getAll();
        res.json(departments);
    } catch (error) {
        next(error);
    }
};

exports.getDepartmentById = async (req, res, next) => {
    const id = parseInt(req.body.id, 10);
    if (isNaN(id)) {
        return res.status(400).send('Invalid ID format');
    }
    try { 
        const department = await DepartmentService.getById(id);
        res.json(department);
    } catch (error) {
        next(error);
    }
};

exports.createDepartment = async (req, res, next) => { 
    try {
        const name = sanitizeInput(req.body.name);
        const locationId = req.body.locationid;
        if (!name) {
            return res.status(400).send('Department name is required.');
        }
        const department = await DepartmentService.create(name, locationId);
        res.status(201).json(department);
    } catch (error) {
        next(error);
    }
};

exports.updateDepartment = async (req, res, next) => { 
    const name = sanitizeInput(req.body.name);
    const id = parseInt(req.body.id, 10);
    if (isNaN(id)) {
        return res.status(400).send('Invalid ID format');
    }
    const locationid = parseInt(req.body.locationid, 10);
    if (isNaN(id)) {
        return res.status(400).send('Invalid ID format');
    }
    if (!name) {
        return res.status(400).send('Department name is required.');
    }
    try {
        const department = await DepartmentService.update(name, id, locationid);
        res.status(201).json(department);
    } catch (error) {
        next(error);
    }
};

exports.deleteDepartment = async (req, res, next) => { 
    const id = parseInt(req.body.id, 10);
    if (isNaN(id)) {
        return res.status(400).send('Invalid ID format');
    }
    try {
        const department = await DepartmentService.delete(id);
        res.status(201).json(department);
    } catch (error) {
        next(error);
    }
};