import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import app from './app.js';
import http from 'http';

const PORT = 5005;
const server = http.createServer(app);

const runTests = async () => {
  let hasError = false;
  
  const post = async (path, body, token) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`http://127.0.0.1:${PORT}${path}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if(!res.ok) { console.error(`[FAIL] POST ${path} -> ${res.status}:`, data); hasError = true; }
    return { status: res.status, data };
  };

  const get = async (path, token) => {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`http://127.0.0.1:${PORT}${path}`, { headers });
    const data = await res.json().catch(() => ({}));
    if(!res.ok) { console.error(`[FAIL] GET ${path} -> ${res.status}:`, data); hasError = true; }
    return { status: res.status, data };
  };

  try {
    // 1. Connect DB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/restaurant-pos');
    console.log('[OK] DB Connected');

    // 2. Start Server
    await new Promise((resolve) => server.listen(PORT, resolve));
    console.log(`[OK] Server listening on ${PORT}`);

    // 3. Login users (assuming they exist from seed)
    const adminRes = await post('/api/auth/login', { email: 'admin@resova.com', password: 'password123' });
    const custRes = await post('/api/auth/login', { email: 'customer@resova.com', password: 'password123' });
    
    if(!adminRes.data.success) throw new Error('Admin login failed');
    const adminToken = adminRes.data.data.token;
    const restaurantId = adminRes.data.data.restaurantId;
    
    if(!custRes.data.success) throw new Error('Customer login failed');
    const custToken = custRes.data.data.token;

    console.log('[OK] Auth verified');

    // 4. Test endpoints
    await get(`/api/products`, adminToken); // Admin get products
    await get(`/api/products/public/${restaurantId}`); // Public get products
    await get(`/api/orders`, adminToken); // Admin get orders
    await get(`/api/customer/orders`, custToken); // Customer get orders
    
    // Create coupon
    const newCoupon = {
      code: `TEST${Date.now()}`.substring(0,10),
      discountType: 'fixed',
      discountValue: 5,
      minOrderValue: 10,
      validFrom: new Date().toISOString(),
      validUntil: new Date(Date.now() + 86400000).toISOString()
    };
    const cRes = await post(`/api/coupons`, newCoupon, adminToken);
    
    // Verify coupon public
    await post(`/api/coupons/public/verify/${restaurantId}`, { code: newCoupon.code, cartTotal: 20 });
    
    // AI Chat test (which tests DB interactions inside AI controller)
    await post(`/api/ai/chat`, { message: 'recommend something', restaurantId, cart: [] });

    if(hasError) {
      console.log('❌ SOME TESTS FAILED');
      process.exit(1);
    } else {
      console.log('✅ ALL API TESTS PASSED');
    }

  } catch (err) {
    console.error('Fatal error during tests:', err);
    process.exit(1);
  } finally {
    server.close();
    await mongoose.disconnect();
    process.exit(hasError ? 1 : 0);
  }
};

runTests();
