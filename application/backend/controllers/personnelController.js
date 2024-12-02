const PersonnelService = require('../services/personnelService');
const { sanitizeInput } = require('../utils/sanitizer');

class PersonnelController {
    async getAll(req, res) {
        try {
            const result = await PersonnelService.getAll();
            if (result.length === 0) {
                return res.status(404).send('Personnel could not be retrieved.');
            }
            res.json(result);
        } catch (error) {
            console.error(error);
            res.status(500).send('Server Error');
        }
    }

    async getAllWithDetails(req, res) {
        try {
            const result = await PersonnelService.getAllWithDetails();
            res.json(result);
        } catch (error) {
            console.error(error);
            res.status(500).send('Server Error');
        }
    }

    async getById(req, res) {
        const id = parseInt(req.body.id, 10);
        if (isNaN(id)) {
            return res.status(400).send('Invalid ID format');
        }
        try {
            const result = await PersonnelService.getById(id);
            if (!result) {
                return res.status(404).send('Employee not found.');
            }
            res.json(result);
        } catch (error) {
            console.error(error);
            res.status(500).send('Server Error');
        }
    }

    async create(req, res) {
        const inputs = {};
        let missingfields = [];
        
        Object.entries(req.body).forEach(([key, value]) => inputs[key] = sanitizeInput(value));
        
        let { firstname, lastname, email, jobtitle, departmentid } = inputs;
        departmentid = parseInt(departmentid, 10);
        if (isNaN(departmentid)) {
            return res.status(400).send('Invalid ID format');
        }
        if (!firstname) missingfields.push('First name');
        if (!lastname) missingfields.push('Last name');
        if (!departmentid) missingfields.push('Department ID');
        
        if (missingfields.length > 0) {
            return res.status(400).send(`The following values are required: ${missingfields.join(', ')}.`);
        }

        try {
            const result = await PersonnelService.create(firstname, lastname, jobtitle, email, departmentid);
            res.status(201).json(result);
        } catch (error) {
            console.error(error);
            res.status(500).send('Server error');
        }
    }

    async update(req, res) {
        const inputs = {};
          
        Object.entries(req.body).forEach(([key, value]) => inputs[key] = sanitizeInput(value));
        
        let { firstname, lastname, email, jobtitle, departmentid } = inputs;
        const id = parseInt(req.body.id, 10);
        departmentid = parseInt(departmentid, 10);
        if (isNaN(id)) {
            return res.status(400).send('Invalid employee ID format');
        }
        if (isNaN(departmentid)) {
            return res.status(400).send('Invalid department ID format');
        }
        try {
            const result = await PersonnelService.update(id, firstname, lastname, jobtitle, email, departmentid);
            res.status(200).json(result);
        } catch (error) {
            console.error(error);
            if (error.message === 'Personnel not found') {
                return res.status(404).send(error.message);
            }
            res.status(500).send('Server error');
        }
    }

    async delete(req, res) {
        const id = parseInt(req.body.id, 10);
        if (isNaN(id)) {
            return res.status(400).send('Invalid ID format');
        }
        try {
            const result = await PersonnelService.delete(id);
            res.status(204).json(result);
        } catch (error) {
            console.error(error);
            res.status(500).send('Server error');
        }
    }
}

module.exports = new PersonnelController();