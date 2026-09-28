const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: String,
  description: String
}, { timestamps: true });

// Indexes for faster queries
categorySchema.index({ name: 1 });              // Category name lookup

module.exports = mongoose.model('Category', categorySchema);