import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 }
});

const cartSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  items: [cartItemSchema],
  appliedCoupon: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon', default: null }
}, { timestamps: true });

const Cart = mongoose.model('Cart', cartSchema);
export default Cart;
