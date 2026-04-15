import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
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
  },
  rating: { type: Number, default: 4.5 },
  numReviews: { type: Number, default: 0 }
}, { timestamps: true });

// Performance indexes for heavily queried fields
productSchema.index({ restaurantId: 1, availability: 1 });
productSchema.index({ 'seo.slug': 1 });
productSchema.index({ restaurantId: 1, category: 1 });

const Product = mongoose.model('Product', productSchema);
export default Product;
