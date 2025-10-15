import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Drone', required: true },
    quantity: { type: Number, default: 1 }
  }],
  totalPrice: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Paid', 'Shipped', 'Delivered'], default: 'Pending' }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
export default Order;
