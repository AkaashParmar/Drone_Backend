import mongoose from 'mongoose';

const stepSchema = new mongoose.Schema({
  icon: { type: String },
  title: { type: String, required: true },
  timestamp: { type: String },
  description: { type: String, required: true },
}, { _id: false });

const faqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
});

const serviceSchema = new mongoose.Schema({
  serviceId: {
    type: String,
    unique: true,
  },
  serviceType: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  steps: {
    type: [stepSchema],
    required: true,
  },
  faqs: { type: [faqSchema], default: [] },
  image: {
    type: String,
    required: true,
  },
}, { timestamps: true });

// Auto-generate serviceId before saving
serviceSchema.pre('save', async function (next) {
  if (!this.serviceId) {
    const lastService = await mongoose.model('Service').findOne().sort({ createdAt: -1 });
    let nextNumber = 1;

    if (lastService && lastService.serviceId) {
      const lastNumber = parseInt(lastService.serviceId.split('-')[1]);
      nextNumber = lastNumber + 1;
    }

    this.serviceId = `SERV-${String(nextNumber).padStart(3, '0')}`;
  }
  next();
});

export default mongoose.model('Service', serviceSchema);
