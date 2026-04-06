import mongoose from 'mongoose';

const staffSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['waiter', 'cashier', 'manager'], required: true },
  phone: { type: String },
  email: { type: String }
}, { timestamps: true });

const Staff = mongoose.model('Staff', staffSchema);
export default Staff;
