import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  brand: { type: String, default: 'House Brand' },
  stock: { type: Number, default: 100 },
  images: { type: [String], default: [] },
  availability: { type: Boolean, default: true },
  description: { type: String },
  seo: {
    title: { type: String },
    description: { type: String },
    keywords: { type: [String] },
    slug: { type: String }
  }
}, { timestamps: true });

const MenuItem = mongoose.model('MenuItem', menuItemSchema);
export default MenuItem;
