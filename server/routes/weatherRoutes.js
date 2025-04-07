const express = require('express');
const router = express.Router();
const weatherCtrl = require('../controllers/weatherController');

// 📦 CRUD Routes

// Create new weather data
router.post('/create', weatherCtrl.createWeather);

// Read all weather entries
router.get('/all', weatherCtrl.getAllWeather);

// Search by location and date range
router.get('/search', weatherCtrl.searchWeather);

// Update a specific weather record
router.put('/update/:id', weatherCtrl.updateWeather);

// Delete a weather record
router.delete('/delete/:id', weatherCtrl.deleteWeather);

// 📤 Export Routes

// Export all weather data as JSON
router.get('/export/json', weatherCtrl.exportJson);

// Export as CSV
router.get('/export/csv', weatherCtrl.exportCsv);

// Export as PDF
router.get('/export/pdf', weatherCtrl.exportPdf);

module.exports = router;
