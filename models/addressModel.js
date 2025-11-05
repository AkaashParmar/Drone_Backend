// models/Address.js
import mongoose from 'mongoose';

const addressSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  label: String,
  fullName: String,
  phone: String,
  addressLine1: String,
  addressLine2: String,
  city: String,
  state: String,
  postalCode: String,
  country: String,
  latitude: { type: Number }, 
  longitude: { type: Number },
  isDefault: { type: Boolean, default: false },
}, {
  timestamps: true
});

export default mongoose.model('Address', addressSchema);
