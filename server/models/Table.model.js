import mongoose from 'mongoose';

const tableSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  number: { type: Number, required: true },
  seats: { type: Number, required: true },
  status: { type: String, enum: ['available', 'occupied', 'reserved'], default: 'available' }
}, { timestamps: true });

const Table = mongoose.model('Table', tableSchema);
export default Table;
