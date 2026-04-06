import mongoose from 'mongoose';

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  address: { type: String },
  phone: { type: String },
  isActive: { type: Boolean, default: true },
  seo: {
    title: { type: String },
    description: { type: String },
    keywords: { type: [String] },
    slug: { type: String, unique: true }
  }
}, { timestamps: true });

const Restaurant = mongoose.model('Restaurant', restaurantSchema);
export default Restaurant;
