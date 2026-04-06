import mongoose from 'mongoose';
import { PLANS } from '../constants/subscriptionPlans.js';

const subscriptionSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  plan: { type: String, enum: [PLANS.BASIC, PLANS.STANDARD, PLANS.PREMIUM], default: PLANS.BASIC },
  status: { type: String, enum: ['active', 'cancelled', 'expired'], default: 'active' },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date }
}, { timestamps: true });

const Subscription = mongoose.model('Subscription', subscriptionSchema);
export default Subscription;
