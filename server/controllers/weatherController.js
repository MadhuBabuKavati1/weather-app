const Weather = require('../models/Weather');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const { createObjectCsvWriter } = require('csv-writer');

// 🌤 CREATE
exports.createWeather = async (req, res) => {
  try {
    const { location, startDate, endDate } = req.body;
    if (!location || !startDate || !endDate) {
      return res.status(400).json({ error: 'Location and date range required' });
    }

    const apiKey = process.env.WEATHER_API_KEY;
    const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${apiKey}&units=metric`);

    const weather = new Weather({
      location,
      startDate,
      endDate,
      temperature: response.data.main.temp,
      condition: response.data.weather[0].description
    });

    const saved = await weather.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to create weather record', details: err.message });
  }
};

// 📖 READ ALL
exports.getAllWeather = async (req, res) => {
  const data = await Weather.find().sort({ dateFetched: -1 });
  res.json(data);
};

// 🔍 FILTER BY LOCATION & DATES
exports.searchWeather = async (req, res) => {
  const { location, from, to } = req.query;
  const filter = {};

  if (location) filter.location = new RegExp(location, 'i');
  if (from && to) filter.dateFetched = { $gte: new Date(from), $lte: new Date(to) };

  const results = await Weather.find(filter).sort({ dateFetched: -1 });
  res.json(results);
};

// ✏️ UPDATE
exports.updateWeather = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const updated = await Weather.findByIdAndUpdate(id, updates, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Update failed', details: err.message });
  }
};

// ❌ DELETE
exports.deleteWeather = async (req, res) => {
  try {
    const { id } = req.params;
    await Weather.findByIdAndDelete(id);
    res.json({ message: 'Record deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Deletion failed', details: err.message });
  }
};

// 📤 EXPORT JSON
exports.exportJson = async (req, res) => {
  const data = await Weather.find();
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(data, null, 2));
};

// 📤 EXPORT CSV
exports.exportCsv = async (req, res) => {
  const data = await Weather.find();
  const csvWriter = createObjectCsvWriter({
    path: 'exports/weather.csv',
    header: [
      { id: 'location', title: 'Location' },
      { id: 'startDate', title: 'Start Date' },
      { id: 'endDate', title: 'End Date' },
      { id: 'temperature', title: 'Temperature (°C)' },
      { id: 'condition', title: 'Condition' },
      { id: 'dateFetched', title: 'Date Fetched' }
    ]
  });

  await csvWriter.writeRecords(data);
  res.download(path.join(__dirname, '../exports/weather.csv'));
};

// 📤 EXPORT PDF
exports.exportPdf = async (req, res) => {
  const data = await Weather.find();
  const doc = new PDFDocument();
  const filePath = path.join(__dirname, '../exports/weather.pdf');

  doc.pipe(fs.createWriteStream(filePath));
  doc.fontSize(16).text('Weather Report', { align: 'center' }).moveDown();

  data.forEach(item => {
    doc
      .fontSize(12)
      .text(`Location: ${item.location}`)
      .text(`Temp: ${item.temperature}°C`)
      .text(`Condition: ${item.condition}`)
      .text(`Start Date: ${item.startDate}`)
      .text(`End Date: ${item.endDate}`)
      .text(`Fetched On: ${item.dateFetched}`)
      .moveDown();
  });

  doc.end();

  doc.on('finish', () => {
    res.download(filePath);
  });
};
