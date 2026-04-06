import app from './app.js';
import connectDB from './config/db.js';
import dotenv from 'dotenv';
import http from 'http';

dotenv.config();

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  const server = http.createServer(app);
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch((err) => {
  console.error("Database connection failed", err);
});
