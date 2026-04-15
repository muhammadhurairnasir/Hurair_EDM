import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  code: { type: String, required: true },
  discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
  discountValue: { type: Number, required: true },
  minOrderValue: { type: Number, default: 0 },
  validFrom: { type: Date, required: true },
  validUntil: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  usageLimit: { type: Number },
  usageCount: { type: Number, default: 0 }
}, { timestamps: true });

couponSchema.index({ restaurantId: 1, code: 1 }, { unique: true });

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;
