import dotenv from 'dotenv';
dotenv.config();
import connectDB from '../config/db.js';
import User from '../models/User.js';

await connectDB();

const email = process.env.ADMIN_EMAIL || 'admin@example.com';
const password = process.env.ADMIN_PASSWORD || 'Admin@12345';
const fullName = process.env.ADMIN_NAME || 'Site Admin';

const existing = await User.findOne({ email: email.toLowerCase() });
if (existing) {
  console.log('Admin already exists:', existing.email);
  process.exit(0);
}

const admin = new User({
  fullName,
  email: email.toLowerCase(),
  password,
  role: 'Admin',
  agreeTerms: true,
  rememberMe: true
});

await admin.save();
console.log('Admin user created:', email);
process.exit(0);
