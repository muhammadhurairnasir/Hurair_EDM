import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true }
});

const orderSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  tableId: { type: mongoose.Schema.Types.ObjectId, ref: 'Table' },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  stripeSessionId: { type: String },
  trackingInfo: {
    carrier: { type: String },
    trackingNumber: { type: String },
    estimatedDelivery: { type: Date }
  }
}, { timestamps: true });

// Performance indexes
orderSchema.index({ customerId: 1, restaurantId: 1 });
orderSchema.index({ restaurantId: 1, status: 1 });
orderSchema.index({ stripeSessionId: 1 });

const Order = mongoose.model('Order', orderSchema);
export default Order;
