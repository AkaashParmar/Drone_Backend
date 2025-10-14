import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const buyerSchema = new mongoose.Schema({
  buyerTypes: { type: [String], default: [] },
  buyerUse: { type: [String], default: [] },
  buyerBudget: { type: Number, default: 3000 },
  buyerRegion: { type: String, default: '' },
  buyerUrgency: { type: String, default: 'Browsing' },
});

const sellerSchema = new mongoose.Schema({
  sellerCompany: { type: String, default: '' },
  sellerEntity: { type: String, default: 'Individual' },
  sellerInventory: { type: Number, default: 0 },
  sellerMarkets: { type: [String], default: [] },
  sellerLocation: { type: String, default: '' },
  sellerDocs: { type: [String], default: [] } // file paths
});

const renterSchema = new mongoose.Schema({
  renterFleet: { type: Number, default: 0 },
  renterRate: { type: Number, default: 0 },
  renterDays: { type: [String], default: [] },
  renterDeposit: { type: String, enum: ['Yes','No'], default: 'Yes' },
  renterPickup: { type: String, default: '' }
});

const partnerSchema = new mongoose.Schema({
  partnerType: { type: [String], default: [] },
  partnerOrg: { type: String, default: '' },
  partnerSite: { type: String, default: '' },
  partnerRegions: { type: [String], default: [] }
});

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  phone: { type: String, default: '' },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  // role: { type: String, enum: ['Buyer', 'Seller', 'Renter', 'Partner'], default: 'Buyer' },
  role: { type: String, enum: ['Buyer', 'Seller', 'Renter', 'Partner', 'Admin'], default: 'Buyer' },


  // Agree terms / remember me
  agreeTerms: { type: Boolean, default: false },
  rememberMe: { type: Boolean, default: false },

  // Role-specific nested objects
  roleDetails: {
    buyer: { type: buyerSchema, default: () => ({}) },
    seller: { type: sellerSchema, default: () => ({}) },
    renter: { type: renterSchema, default: () => ({}) },
    partner: { type: partnerSchema, default: () => ({}) }
  }
}, { timestamps: true });

// Hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Remove password when converting to JSON
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
}

const User = mongoose.model('User', userSchema);
export default User;
