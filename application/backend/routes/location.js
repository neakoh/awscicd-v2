const express = require('express');
const router = express.Router();
const { authorize } = require('../middleware/auth');
const { 
    getAllLocations, 
    getLocationById, 
    createLocation,
    updateLocation,
    deleteLocation 
} = require('../controllers/locationController');

router.get('/', getAllLocations);
router.post('/id', getLocationById);
router.post('/', authorize(['admin']), createLocation);
router.put('/', authorize(['admin']), updateLocation);
router.delete('/', authorize(['admin']), deleteLocation);

module.exports = router;