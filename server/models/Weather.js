const mongoose = require('mongoose');

const weatherSchema = new mongoose.Schema({
  location: String,
  startDate: Date,
  endDate: Date,
  temperature: Number,
  condition: String,
  dateFetched: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Weather', weatherSchema);

