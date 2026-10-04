const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../src/models/User');

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const users = [
    { email: 'user@test.com', password: 'Password123', role: 'user' },
    { email: 'vendor@test.com', password: 'Password123', role: 'vendor' },
    { email: 'admin@test.com', password: 'Password123', role: 'admin' },
  ];

  for (const u of users) {
    const passwordHash = await bcrypt.hash(u.password, 12);
    await new User({
      email: u.email,
      passwordHash,
      role: u.role,
    }).save();
  }

  console.log('Users created successfully');
  process.exit();
})();
