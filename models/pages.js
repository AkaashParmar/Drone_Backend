// backend/models/Page.js
import mongoose from 'mongoose';

const SectionSchema = new mongoose.Schema({
  type: { type: String, required: true }, // 'hero','features','cards','faq','cta','custom'
  title: String,
  subtitle: String,
  content: String,
  items: [mongoose.Schema.Types.Mixed], // flexible list (cards, features etc)
  images: [String], // urls
  meta: mongoose.Schema.Types.Mixed
}, { _id: false });

const PageSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true }, // e.g. 'aero-defense'
  title: { type: String, required: true },
  description: String,
  hero: mongoose.Schema.Types.Mixed, // quick hero block
  sections: [SectionSchema],
  status: { type: String, enum: ['draft','published'], default: 'draft' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

PageSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('Page', PageSchema);
