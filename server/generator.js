const fs = require('fs');

const generateProducts = () => {
  const burgers = [];
  const pizzas = [];
  const desserts = [];
  const sides = [];

  const burgerAdjectives = ['Double', 'Smash', 'Classic', 'Spicy', 'Truffle', 'Ultimate', 'BBQ', 'Bacon', 'Angus', 'Wagyu', 'Crispy', 'Crunchy', 'Cheesy', 'Beyond', 'Jalapeno', 'Mushroom', 'Swiss', 'Avocado', 'Ranch', 'Gourmet'];
  const pizzaAdjectives = ['New York', 'Chicago Deep Dish', 'Wood Fired', 'Spicy', 'Truffle', 'Classic', 'Margherita', 'Pepperoni', 'Veggie', 'Meatball', 'Hawaiian', 'BBQ Chicken', 'Buffalo Chicken', 'White', 'Four Cheese', 'Prosciutto', 'Pesto', 'Garlic', 'Sicilian', 'Artisan'];
  const dessertAdjectives = ['Warm', 'Fudgy', 'Classic', 'New York', 'Lemon', 'Strawberry', 'Chocolate', 'Vanilla', 'Caramel', 'Oreo', 'Mint', 'Peanut Butter', 'Churros', 'Glazed', 'Triple', 'Dark', 'Raspberry', 'Pecan', 'Toasted', 'Decadent'];
  const sideAdjectives = ['Crispy', 'Cajun', 'Truffle', 'Garlic', 'Parmesan', 'Loaded', 'Sweet Potato', 'Classic', 'Curly', 'Waffle', 'Steak', 'Shoestring', 'Spicy', 'Cheese', 'Bacon', 'Onion', 'Zucchini', 'Jalapeno', 'Mozzarella', 'Thick Cut'];

  for (let i = 0; i < 20; i++) {
    burgers.push(`{ restaurantId: restaurant._id, name: '${burgerAdjectives[i]} Burger', price: ${(10 + i * 0.5).toFixed(2)}, category: 'Burgers', description: 'Premium ${burgerAdjectives[i].toLowerCase()} burger with fresh ingredients.', availability: true }`);
  }

  for (let i = 0; i < 20; i++) {
    pizzas.push(`{ restaurantId: restaurant._id, name: '${pizzaAdjectives[i]} Pizza', price: ${(15 + i * 0.5).toFixed(2)}, category: 'Pizzas', description: 'Delicious ${pizzaAdjectives[i].toLowerCase()} pizza baked to perfection.', availability: true }`);
  }

  for (let i = 0; i < 20; i++) {
    desserts.push(`{ restaurantId: restaurant._id, name: '${dessertAdjectives[i]} Treat', price: ${(5 + i * 0.2).toFixed(2)}, category: 'Desserts', description: 'Sweet ${dessertAdjectives[i].toLowerCase()} dessert to finish your meal.', availability: true }`);
  }

  for (let i = 0; i < 20; i++) {
    sides.push(`{ restaurantId: restaurant._id, name: '${sideAdjectives[i]} Fries', price: ${(4 + i * 0.2).toFixed(2)}, category: 'Fries', description: 'Side of ${sideAdjectives[i].toLowerCase()} fries.', availability: true }`);
  }

  return [...burgers, ...pizzas, ...sides, ...desserts].join(',\n      ');
};

const output = `import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.model.js';
import Restaurant from './models/Restaurant.model.js';
import Product from './models/Product.model.js';
import Order from './models/Order.model.js';
import Table from './models/Table.model.js';
import Staff from './models/Staff.model.js';

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/restaurant-pos');
    console.log(\`MongoDB Connected: \${conn.connection.host}\`);
  } catch (error) {
    console.error(\`Error: \${error.message}\`);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('Clearing old data from database...');
    // Clear out
    await User.deleteMany();
    await Restaurant.deleteMany();
    await Product.deleteMany();
    await Order.deleteMany();
    await Table.deleteMany();
    await Staff.deleteMany();

    console.log('Building Resova Master Configuration...');

    // 1. Create B2C Platform Owner
    const adminUser = await User.create({
      name: 'Resova Admin',
      email: 'admin@resova.com',
      password: 'password123',
      role: 'restaurant_owner'
    });

    // 2. Create B2C Demo Customer
    const customerUser = await User.create({
      name: 'John Doe (Customer)',
      email: 'customer@resova.com',
      password: 'password123',
      role: 'customer'
    });

    // 3. Create Single Master Tenant
    const restaurant = await Restaurant.create({
      name: 'Resova E-Commerce',
      owner: adminUser._id,
      address: '123 E-Commerce Blvd, Digital City',
      phone: '800-RESOVA-1',
      seo: {
        slug: 'resova', // MUST be inside SEO object for frontend URL resolution
        title: 'Resova Restaurant Delivery',
        description: 'Order your favorite meals online with Resova.'
      }
    });

    adminUser.restaurantId = restaurant._id;
    await adminUser.save();

    console.log('Populating Premium E-Commerce Catalog...');
    const products = await Product.insertMany([
      ${generateProducts()}
    ]);

    console.log('Configuring Local Operations (Tables & Staff)...');
    const tables = await Table.insertMany([
      { restaurantId: restaurant._id, number: 1, seats: 2, status: 'available' },
      { restaurantId: restaurant._id, number: 2, seats: 4, status: 'available' },
      { restaurantId: restaurant._id, number: 3, seats: 6, status: 'available' },
    ]);

    await Staff.insertMany([
      { restaurantId: restaurant._id, name: 'Alice Walker', role: 'manager', phone: '555-0001' },
      { restaurantId: restaurant._id, name: 'Bob Delivery', role: 'waiter', phone: '555-0002' },
    ]);

    console.log('Generating E-Commerce Order History...');
    await Order.insertMany([
      {
        restaurantId: restaurant._id,
        customerId: customerUser._id,
        items: [
          { product: products[0]._id, name: products[0].name, quantity: 1, price: products[0].price },
          { product: products[20]._id, name: products[20].name, quantity: 1, price: products[20].price }
        ],
        totalAmount: products[0].price + products[20].price,
        status: 'delivered'
      },
      {
        restaurantId: restaurant._id,
        customerId: customerUser._id,
        items: [
          { product: products[40]._id, name: products[40].name, quantity: 2, price: products[40].price }
        ],
        totalAmount: products[40].price * 2,
        status: 'pending'
      }
    ]);

    console.log('\\n=================================');
    console.log('✅ DATABASE FULLY SEEDED FOR SINGLE-TENANT');
    console.log('=================================');
    console.log('Test Accounts:');
    console.log('🧑‍💼 Resova Admin: admin@resova.com');
    console.log('🛒 Customer: customer@resova.com');
    console.log('🔑 Password (All): password123');
    console.log('=================================\\n');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedDatabase();
\`;

fs.writeFileSync('seed.js', output);
console.log('Done generating seed.js');
