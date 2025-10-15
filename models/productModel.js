import mongoose from 'mongoose';

const droneSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, enum: ['Drone', 'Accessory'], default: 'Drone' },
  brand: { type: String, enum: ['DJI', 'International', 'Indian', 'Used'], required: true },
  image: { type: String, default: '' },
  description: { type: String, default: '' },
  price: { type: Number, required: true },
  discountedPrice: { type: Number, default: 0 },

  // General specs
  weight: { type: String },
  flightTime: { type: String },
  camera: { type: String },

  // Aircraft specifications
  aircraftSpecs: {
    weight: String,
    maxSpeed: String,
    maxFlightTime: String,
    maxAltitude: String,
    dimensions: String,
    horizontalSpeed: String,
    windResistance: String
  },

  // Camera specifications
  cameraSpecs: {
    photoResolution: String,
    videoResolution: String,
    sensor: String,
    fieldOfView: String,
    ISO: String
  },

  // Gimbal specifications
  gimbalSpecs: {
    stabilization: String,
    control: String,
    range: String
  },

  // Battery specifications
  batterySpecs: {
    type: {
      type: String
    },
    voltage: String,
    flightTime: String
  },

  // Video streaming specifications
  videoStreamingSpecs: {
    resolution: String,
    latency: String,
    transmission: String
  },

  // Remote controller specifications
  remoteControllerSpecs: {
    controlRange: String,
    battery: String,
    display: String
  },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }

}, { timestamps: true });

const Drone = mongoose.model('Drone', droneSchema);
export default Drone;
