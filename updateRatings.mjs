import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, 'server', '.env') });

const productSchema = new mongoose.Schema({
  rating: { type: Number, default: 4.5 },
  numReviews: { type: Number, default: 0 }
}, { strict: false });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

const seedRatings = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/restaurant-pos');
    console.log('Connected to DB');

    const products = await Product.find();
    console.log(`Updating ${products.length} products...`);

    for (const p of products) {
      // Create a curated distribution
      let rating = 4.5;
      if (p.name.includes('Wagyu')) rating = 4.9;
      else if (p.name.includes('Truffle')) rating = 4.8;
      else if (p.name.includes('Pepperoni')) rating = 4.7;
      else rating = (Math.random() * (4.8 - 4.0) + 4.0).toFixed(1);

      const reviews = Math.floor(Math.random() * 200) + 50;
      await Product.findByIdAndUpdate(p._id, { rating: parseFloat(rating), numReviews: reviews });
    }

    console.log('✅ Ratings updated successfully!');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

seedRatings();
