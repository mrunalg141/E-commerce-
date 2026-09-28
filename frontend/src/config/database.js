const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`✓ Database connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`✗ Database connection error: ${error.message}`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('✓ Database disconnected');
  } catch (error) {
    console.error(`✗ Database disconnection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { connectDB, disconnectDB };
