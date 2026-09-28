const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  companyName: String
}, { timestamps: true });

// Indexes for faster queries
vendorSchema.index({ email: 1 });
vendorSchema.index({ companyName: 'text' });    // Text search on company

module.exports = mongoose.model('Vendor', vendorSchema);
