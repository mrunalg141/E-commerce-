const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  stock: Number,
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' }
}, { timestamps: true });

// Indexes for faster queries
productSchema.index({ vendorId: 1 });           // Vendor's products
productSchema.index({ categoryId: 1 });         // Category filtering
productSchema.index({ price: 1 });              // Price sorting/filtering
productSchema.index({ name: 'text', description: 'text' }); // Text search

module.exports = mongoose.model('Product', productSchema);
