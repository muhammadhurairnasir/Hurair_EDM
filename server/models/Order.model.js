import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
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
  status: { type: String, enum: ['Pending', 'Preparing', 'Completed'], default: 'Pending' }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
export default Order;
