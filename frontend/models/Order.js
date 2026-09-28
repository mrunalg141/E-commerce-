const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, default: 'pending' },
  totalAmount: Number
}, { timestamps: true });

// Indexes for faster queries
orderSchema.index({ userId: 1 });               // User's orders
orderSchema.index({ status: 1 });               // Order status filtering
orderSchema.index({ userId: 1, createdAt: -1 }); // User's recent orders

module.exports = mongoose.model('Order', orderSchema);
