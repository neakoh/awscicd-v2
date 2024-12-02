const LocationService = require('../services/locationService');
const { sanitizeInput } = require('../utils/sanitizer');

exports.getAllLocations = async (req, res, next) => {
    try {
        const locations = await LocationService.getAll();
        res.json(locations);
    } catch (error) {
        next(error);
    }
};

exports.getLocationById = async (req, res, next) => {
    const id = parseInt(req.body.id, 10);
    if (isNaN(id)) {
        return res.status(400).send('Invalid ID format');
    }
    try {
        const locations = await LocationService.getById(id);
        res.json(locations);
    } catch (error) {
        next(error);
    }
};

exports.createLocation = async (req, res, next) => { 
    try {
        const name = sanitizeInput(req.body.name);
        if (!name) {
            return res.status(400).send('Location name is required.');
        }
        const location = await LocationService.create(name);
        res.status(201).json(location);
    } catch (error) {
        next(error);
    }
};

exports.updateLocation = async (req, res, next) => { 
    const name = sanitizeInput(req.body.name);
    const id = parseInt(req.body.id, 10);
    if (isNaN(id)) {
        return res.status(400).send('Invalid ID format');
    }
    if (!name) {
        return res.status(400).send('Location name is required.');
    }
    try {
        const location = await LocationService.update(name, id);
        res.status(201).json(location);
    } catch (error) {
        next(error);
    }
};

exports.deleteLocation = async (req, res, next) => { 
    const id = req.body.id;
    if (!id) {
        return res.status(400).send('Location id is required.');
    }
    try {
        const location = await LocationService.delete(id);
        res.status(201).json(location);
    } catch (error) {
        next(error);
    }
};
