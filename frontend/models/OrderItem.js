const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  quantity: Number,
  price: Number
}, { timestamps: true });

// Indexes for faster queries
orderItemSchema.index({ orderId: 1 });          // Order's items lookup
orderItemSchema.index({ productId: 1 });        // Product sales lookup

module.exports = mongoose.model('OrderItem', orderItemSchema);
