const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function createAdminUser() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/stickjunkey', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const User = require('./models/User');
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@stickjunkey.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = new User({
      name: 'Admin',
      email: 'admin@stickjunkey.com',
      password: hashedPassword,
      phoneNumber: '+1234567890',
      isAdmin: true
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully!');
    console.log('Email: admin@stickjunkey.com');
    console.log('Password: admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser();