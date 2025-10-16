import mongoose from 'mongoose';

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
