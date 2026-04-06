import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.model.js';
import Restaurant from './models/Restaurant.model.js';
import Subscription from './models/Subscription.model.js';
import MenuItem from './models/MenuItem.model.js';
import Order from './models/Order.model.js';
import Table from './models/Table.model.js';
import Staff from './models/Staff.model.js';

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/restaurant-pos');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('Clearing old data...');
    await User.deleteMany();
    await Restaurant.deleteMany();
    await Subscription.deleteMany();
    await MenuItem.deleteMany();
    await Order.deleteMany();
    await Table.deleteMany();
    await Staff.deleteMany();

    console.log('Inserting Demo User & Restaurant...');
    const adminUser = await User.create({
      name: 'Super Admin',
      email: 'admin@saas.com',
      password: 'password123',
      role: 'system_admin'
    });

    const user = await User.create({
      name: 'Demo Owner',
      email: 'demo@restaurant.com',
      password: 'password123',
      role: 'restaurant_owner'
    });

    const restaurant = await Restaurant.create({
      name: 'The Great Feast',
      owner: user._id,
      address: '123 Flavor Street, Foodville',
      phone: '555-0100'
    });

    user.restaurantId = restaurant._id;
    await user.save();

    await Subscription.create({
      restaurantId: restaurant._id,
      plan: 'Premium',
      status: 'active'
    });

    console.log('Inserting Menu Items...');
    const menuItems = await MenuItem.insertMany([
      { restaurantId: restaurant._id, name: 'Truffle Burger', price: 18.99, category: 'Mains', description: 'Angus beef, truffle aioli, brioche bun.', availability: true },
      { restaurantId: restaurant._id, name: 'Margherita Pizza', price: 14.50, category: 'Mains', description: 'Fresh tomatoes, mozzarella, basil.', availability: true },
      { restaurantId: restaurant._id, name: 'Caesar Salad', price: 10.00, category: 'Starters', description: 'Romaine, croutons, parmesan, classic dressing.', availability: true },
      { restaurantId: restaurant._id, name: 'Cheesecake', price: 8.50, category: 'Desserts', description: 'New York style with berry compote.', availability: true },
    ]);

    console.log('Inserting Tables...');
    const tables = await Table.insertMany([
      { restaurantId: restaurant._id, number: 1, seats: 2, status: 'available' },
      { restaurantId: restaurant._id, number: 2, seats: 4, status: 'occupied' },
      { restaurantId: restaurant._id, number: 3, seats: 4, status: 'available' },
      { restaurantId: restaurant._id, number: 4, seats: 6, status: 'reserved' },
      { restaurantId: restaurant._id, number: 5, seats: 8, status: 'available' },
    ]);

    console.log('Inserting Staff...');
    await Staff.insertMany([
      { restaurantId: restaurant._id, name: 'Alice Smith', role: 'manager', phone: '555-0101' },
      { restaurantId: restaurant._id, name: 'Bob Johnson', role: 'waiter', phone: '555-0102' },
      { restaurantId: restaurant._id, name: 'Charlie Brown', role: 'cashier', phone: '555-0103' },
    ]);

    console.log('Inserting Orders...');
    await Order.insertMany([
      {
        restaurantId: restaurant._id,
        tableId: tables[1]._id,
        items: [
          { menuItem: menuItems[0]._id, name: menuItems[0].name, quantity: 2, price: menuItems[0].price },
          { menuItem: menuItems[3]._id, name: menuItems[3].name, quantity: 1, price: menuItems[3].price }
        ],
        totalAmount: (menuItems[0].price * 2) + menuItems[3].price,
        status: 'Preparing'
      },
      {
        restaurantId: restaurant._id,
        items: [
          { menuItem: menuItems[1]._id, name: menuItems[1].name, quantity: 1, price: menuItems[1].price }
        ],
        totalAmount: menuItems[1].price,
        status: 'Completed'
      }
    ]);

    console.log('Database seeded successfully!');
    console.log('=================================');
    console.log('Use these credentials to login:');
    console.log('--- Restaurant POS Admin ---');
    console.log('Email: demo@restaurant.com');
    console.log('Password: password123');
    console.log('--- Super Admin (SaaS & SEO) ---');
    console.log('Email: admin@saas.com');
    console.log('Password: password123');
    console.log('=================================');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedDatabase();
