import mongoose from 'mongoose';
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
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('Clearing old data from database...');
    // Drop Collections
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
        slug: 'resova',
        title: 'Resova Restaurant Delivery',
        description: 'Order your favorite meals online with Resova.'
      }
    });

    adminUser.restaurantId = restaurant._id;
    await adminUser.save();

    console.log('Populating Premium E-Commerce Catalog with 80 Items...');
    const rawProducts = [
      // 20 BURGERS
      { restaurantId: restaurant._id, name: 'Double Wagyu Burger', price: 24.99, category: 'Burgers', description: 'Two 8oz wagyu patties, aged cheddar, caramelised onions, truffle mayo on an artisan brioche.', availability: true },
      { restaurantId: restaurant._id, name: 'Classic Smash Burger', price: 14.50, category: 'Burgers', description: 'Two smashed beef patties, American cheese, house pickles, secret sauce.', availability: true },
      { restaurantId: restaurant._id, name: 'Spicy Jalapeno Burger', price: 16.00, category: 'Burgers', description: 'Beef patty, pepper jack cheese, roasted jalapenos, chipotle aioli.', availability: true },
      { restaurantId: restaurant._id, name: 'BBQ Bacon Burger', price: 17.50, category: 'Burgers', description: 'Angus beef, smoked bacon, crispy onion rings, hickory BBQ sauce.', availability: true },
      { restaurantId: restaurant._id, name: 'Beyond Vegan Burger', price: 18.00, category: 'Burgers', description: 'Plant-based patty, vegan cheddar, lettuce, tomato, vegan mayo.', availability: true },
      { restaurantId: restaurant._id, name: 'Mushroom Swiss Burger', price: 16.50, category: 'Burgers', description: 'Swiss cheese, sautéed wild mushrooms, garlic aioli.', availability: true },
      { restaurantId: restaurant._id, name: 'Avocado Ranch Burger', price: 16.99, category: 'Burgers', description: 'Beef patty with fresh avocado, ranch dressing, lettuce, and tomato.', availability: true },
      { restaurantId: restaurant._id, name: 'Teriyaki Pineapple Burger', price: 17.00, category: 'Burgers', description: 'Grilled pineapple, teriyaki glaze, and cheddar on an Angus patty.', availability: true },
      { restaurantId: restaurant._id, name: 'Breakfast Burger', price: 18.50, category: 'Burgers', description: 'Topped with a fried egg, hash browns, bacon, and cheddar cheese.', availability: true },
      { restaurantId: restaurant._id, name: 'Spicy Sriracha Burger', price: 15.99, category: 'Burgers', description: 'Sriracha mayo, pepper jack, and jalapeños on a smashed patty.', availability: true },
      { restaurantId: restaurant._id, name: 'Truffle Burger', price: 22.00, category: 'Burgers', description: 'Truffle oil, parmesan crisp, and a wagyu patty on a brioche bun.', availability: true },
      { restaurantId: restaurant._id, name: 'Gourmet Blue Cheese Burger', price: 17.50, category: 'Burgers', description: 'Crumbled blue cheese, caramelized onions, and balsamic glaze.', availability: true },
      { restaurantId: restaurant._id, name: 'Western Rodeo Burger', price: 18.99, category: 'Burgers', description: 'Thick cut onion rings, BBQ sauce, and brisket on top of a burger.', availability: true },
      { restaurantId: restaurant._id, name: 'Crispy Chicken Burger', price: 15.50, category: 'Burgers', description: 'Fried chicken breast, pickles, and spicy mayo on a toasted bun.', availability: true },
      { restaurantId: restaurant._id, name: 'Turkey Burger', price: 14.99, category: 'Burgers', description: 'Lean ground turkey, avocado, and cranberry mayo.', availability: true },
      { restaurantId: restaurant._id, name: 'Salmon Burger', price: 19.50, category: 'Burgers', description: 'Wild-caught salmon patty with dill tartar sauce and arugula.', availability: true },
      { restaurantId: restaurant._id, name: 'Bison Burger', price: 21.00, category: 'Burgers', description: 'Lean ground bison, smoked gouda, and roasted red pepper.', availability: true },
      { restaurantId: restaurant._id, name: 'Peanut Butter Bacon Burger', price: 16.50, category: 'Burgers', description: 'Unexpected yet delicious combination of peanut butter and crispy bacon.', availability: true },
      { restaurantId: restaurant._id, name: 'Mac and Cheese Burger', price: 17.99, category: 'Burgers', description: 'A fried mac and cheese patty on top of a classic smashed burger.', availability: true },
      { restaurantId: restaurant._id, name: 'Monster Triple Burger', price: 28.00, category: 'Burgers', description: 'Three massive patties, quadruple cheese, and unlimited toppings.', availability: true },

      // 20 PIZZAS
      { restaurantId: restaurant._id, name: 'Margherita Pizza', price: 15.00, category: 'Pizzas', description: 'San Marzano tomato sauce, fresh mozzarella, torn basil, EVOO.', availability: true },
      { restaurantId: restaurant._id, name: 'Spicy Pepperoni Pizza', price: 19.50, category: 'Pizzas', description: 'Wood-fired crust, San Marzano tomato sauce, spicy pepperoni, hot honey drizzle.', availability: true },
      { restaurantId: restaurant._id, name: 'Truffle Mushroom Pizza', price: 22.00, category: 'Pizzas', description: 'Bianca base, roasted wild mushrooms, truffle oil, parmesan.', availability: true },
      { restaurantId: restaurant._id, name: 'BBQ Chicken Pizza', price: 21.00, category: 'Pizzas', description: 'House BBQ sauce, grilled chicken, red onions, cilantro.', availability: true },
      { restaurantId: restaurant._id, name: 'Meat Lovers Pizza', price: 24.00, category: 'Pizzas', description: 'Pepperoni, Italian sausage, bacon, ham, mozzarella.', availability: true },
      { restaurantId: restaurant._id, name: 'Hawaiian Pizza', price: 18.50, category: 'Pizzas', description: 'Tomato sauce, mozzarella, roasted pineapple, prosciutto cotto.', availability: true },
      { restaurantId: restaurant._id, name: 'Buffalo Chicken Pizza', price: 20.00, category: 'Pizzas', description: 'Buffalo sauce base, grilled chicken, mozzarella, drizzled with ranch.', availability: true },
      { restaurantId: restaurant._id, name: 'Four Cheese Classic Pizza', price: 17.50, category: 'Pizzas', description: 'Mozzarella, ricotta, parmesan, and gorgonzola on a white base.', availability: true },
      { restaurantId: restaurant._id, name: 'Veggie Supreme Pizza', price: 18.00, category: 'Pizzas', description: 'Bell peppers, onions, black olives, mushrooms, and spinach.', availability: true },
      { restaurantId: restaurant._id, name: 'White Garlic Pizza', price: 16.50, category: 'Pizzas', description: 'Roasted garlic, ricotta cheese, and mozzarella white pie.', availability: true },
      { restaurantId: restaurant._id, name: 'Italian Sausage & Peppers Pizza', price: 19.00, category: 'Pizzas', description: 'Spicy Italian sausage with roasted red and green peppers.', availability: true },
      { restaurantId: restaurant._id, name: 'Prosciutto & Arugula Pizza', price: 23.00, category: 'Pizzas', description: 'Baked mozzarella base topped with fresh arugula and prosciutto.', availability: true },
      { restaurantId: restaurant._id, name: 'Pesto Chicken Pizza', price: 20.50, category: 'Pizzas', description: 'Basil pesto base with grilled chicken and sun-dried tomatoes.', availability: true },
      { restaurantId: restaurant._id, name: 'Meatball Ricotta Pizza', price: 21.50, category: 'Pizzas', description: 'House-made meatballs, dollops of ricotta, and fresh basil.', availability: true },
      { restaurantId: restaurant._id, name: 'Mediterranean Pizza', price: 18.50, category: 'Pizzas', description: 'Feta cheese, Kalamata olives, cherry tomatoes, and red onions.', availability: true },
      { restaurantId: restaurant._id, name: 'Deep Dish Chicago Pizza', price: 28.00, category: 'Pizzas', description: 'Thick crust stuffed with massive amounts of cheese and chunky tomato sauce.', availability: true },
      { restaurantId: restaurant._id, name: 'Spicy Vodka Pizza', price: 20.00, category: 'Pizzas', description: 'Creamy and spicy vodka sauce base topped with fresh mozzarella.', availability: true },
      { restaurantId: restaurant._id, name: 'Artichoke & Spinach Pizza', price: 19.00, category: 'Pizzas', description: 'A creamy spinach and artichoke dip inspired pizza pie.', availability: true },
      { restaurantId: restaurant._id, name: 'Vegan Supreme Pizza', price: 21.00, category: 'Pizzas', description: 'Vegan cheese, Beyond sausage, and mixed roasted vegetables.', availability: true },
      { restaurantId: restaurant._id, name: 'Sweet Bacon Jam Pizza', price: 23.50, category: 'Pizzas', description: 'Bacon jam base with goat cheese and caramelized red onions.', availability: true },

      // 20 FRIES & SIDES
      { restaurantId: restaurant._id, name: 'Classic French Fries', price: 5.99, category: 'Fries', description: 'Crispy skin-on fries tossed in sea salt.', availability: true },
      { restaurantId: restaurant._id, name: 'Truffle Parmesan Fries', price: 8.99, category: 'Fries', description: 'Hand-cut fries tossed in white truffle oil and reggiano.', availability: true },
      { restaurantId: restaurant._id, name: 'Sweet Potato Fries', price: 7.50, category: 'Fries', description: 'Crispy sweet potato fries with a side of maple aioli.', availability: true },
      { restaurantId: restaurant._id, name: 'Loaded Cheese Fries', price: 9.50, category: 'Fries', description: 'Fries smothered in melted cheddar, applewood bacon bits, and scallions.', availability: true },
      { restaurantId: restaurant._id, name: 'Beer Battered Onion Rings', price: 6.99, category: 'Fries', description: 'Thick-cut beer-battered onion rings with ranch.', availability: true },
      { restaurantId: restaurant._id, name: 'Spicy Cajun Fries', price: 6.50, category: 'Fries', description: 'Crispy fries dusted with house-made cajun seasoning.', availability: true },
      { restaurantId: restaurant._id, name: 'Waffle Fries', price: 6.00, category: 'Fries', description: 'Crispy criss-cut waffle fries.', availability: true },
      { restaurantId: restaurant._id, name: 'Curly Fries', price: 6.50, category: 'Fries', description: 'Seasoned spiral-cut curly fries.', availability: true },
      { restaurantId: restaurant._id, name: 'Garlic Butter Fries', price: 7.00, category: 'Fries', description: 'Tossed in crushed garlic, parsley, and melted butter.', availability: true },
      { restaurantId: restaurant._id, name: 'Shoestring Fries', price: 5.50, category: 'Fries', description: 'Extra thin and crispy potato strings.', availability: true },
      { restaurantId: restaurant._id, name: 'Poutine Fries', price: 11.50, category: 'Fries', description: 'Classic Canadian poutine with cheese curds and dark gravy.', availability: true },
      { restaurantId: restaurant._id, name: 'Tater Tots', price: 6.50, category: 'Fries', description: 'Golden crispy potato bites.', availability: true },
      { restaurantId: restaurant._id, name: 'Sweet & Spicy Fries', price: 7.50, category: 'Fries', description: 'Sweet potato fries tossed in cayenne pepper and brown sugar.', availability: true },
      { restaurantId: restaurant._id, name: 'Mashed Potato Balls', price: 8.00, category: 'Fries', description: 'Fried balls of creamy mashed potatoes with a gravy dip.', availability: true },
      { restaurantId: restaurant._id, name: 'Mozzarella Sticks', price: 9.00, category: 'Fries', description: 'Six breaded mozzarella sticks with marinara dipping sauce.', availability: true },
      { restaurantId: restaurant._id, name: 'Jalapeno Poppers', price: 8.50, category: 'Fries', description: 'Cream cheese stuffed jalapenos, breaded and fried to perfection.', availability: true },
      { restaurantId: restaurant._id, name: 'Fried Pickles', price: 7.00, category: 'Fries', description: 'Crispy battered dill pickle chips with spicy ranch.', availability: true },
      { restaurantId: restaurant._id, name: 'Chili Cheese Fries', price: 10.50, category: 'Fries', description: 'Fries smothered in hearty beef chili and melted cheddar.', availability: true },
      { restaurantId: restaurant._id, name: 'Zucchini Fries', price: 7.50, category: 'Fries', description: 'Lightly breaded zucchini sticks served with marinara.', availability: true },
      { restaurantId: restaurant._id, name: 'Mac & Cheese Bites', price: 9.50, category: 'Fries', description: 'Deep fried bite-sized portions of gooey mac and cheese.', availability: true },

      // 20 DESSERTS
      { restaurantId: restaurant._id, name: 'New York Cheesecake', price: 9.50, category: 'Desserts', description: 'Classic baked vanilla cheesecake with fresh strawberry compote.', availability: true },
      { restaurantId: restaurant._id, name: 'Warm Chocolate Lava Cake', price: 11.00, category: 'Desserts', description: 'Gooey chocolate center, served with vanilla bean ice cream.', availability: true },
      { restaurantId: restaurant._id, name: 'Tiramisu', price: 10.00, category: 'Desserts', description: 'Espresso-soaked ladyfingers, mascarpone cream, cocoa powder.', availability: true },
      { restaurantId: restaurant._id, name: 'Salted Caramel Brownie', price: 8.50, category: 'Desserts', description: 'Fudgy brownie topped with sea salt and caramel drizzle.', availability: true },
      { restaurantId: restaurant._id, name: 'Classic Vanilla Milkshake', price: 7.00, category: 'Desserts', description: 'Hand-spun vanilla bean ice cream topped with whipped cream.', availability: true },
      { restaurantId: restaurant._id, name: 'Oreo Crumbles Shake', price: 8.00, category: 'Desserts', description: 'Crushed Oreos blended with thick vanilla ice cream.', availability: true },
      { restaurantId: restaurant._id, name: 'Triple Chocolate Shake', price: 8.50, category: 'Desserts', description: 'Chocolate ice cream, fudge syrup, and chocolate chips.', availability: true },
      { restaurantId: restaurant._id, name: 'Strawberry Shortcake', price: 9.00, category: 'Desserts', description: 'Sponge cake layered with fresh strawberries and whipped cream.', availability: true },
      { restaurantId: restaurant._id, name: 'Churros with Chocolate', price: 7.50, category: 'Desserts', description: 'Four crispy churros coated in cinnamon sugar with a warm chocolate dip.', availability: true },
      { restaurantId: restaurant._id, name: 'Apple Pie', price: 8.00, category: 'Desserts', description: 'Traditional baked apple pie with a flaky butter crust.', availability: true },
      { restaurantId: restaurant._id, name: 'Key Lime Pie', price: 8.50, category: 'Desserts', description: 'Tart and sweet key lime pie with a graham cracker crust.', availability: true },
      { restaurantId: restaurant._id, name: 'Pecan Pie', price: 9.00, category: 'Desserts', description: 'Southern style sweet pecan pie.', availability: true },
      { restaurantId: restaurant._id, name: 'Cannoli', price: 6.50, category: 'Desserts', description: 'Two crisp pastry shells filled with sweet ricotta chocolate cream.', availability: true },
      { restaurantId: restaurant._id, name: 'Creme Brulee', price: 10.50, category: 'Desserts', description: 'Classic French vanilla custard with a caramelized sugar top.', availability: true },
      { restaurantId: restaurant._id, name: 'Red Velvet Cake', price: 9.50, category: 'Desserts', description: 'Moist red velvet sponge with rich cream cheese frosting.', availability: true },
      { restaurantId: restaurant._id, name: 'Lemon Meringue Pie', price: 8.50, category: 'Desserts', description: 'Zesty lemon filling topped with a cloud of toasted meringue.', availability: true },
      { restaurantId: restaurant._id, name: 'Funnel Cake', price: 7.00, category: 'Desserts', description: 'Carnival style funnel cake dusted with powdered sugar.', availability: true },
      { restaurantId: restaurant._id, name: 'Glazed Donut Burger', price: 12.00, category: 'Desserts', description: 'Yes, dessert! A sweet filling stuffed inside a hot glazed donut.', availability: true },
      { restaurantId: restaurant._id, name: 'Chocolate Chip Cookie Skillet', price: 11.50, category: 'Desserts', description: 'A giant warm cookie served in a cast iron skillet with ice cream.', availability: true },
      { restaurantId: restaurant._id, name: 'Matcha Green Tea Ice Cream', price: 6.00, category: 'Desserts', description: 'Three smooth scoops of authentic Japanese matcha ice cream.', availability: true }
    ];

    const products = await Product.insertMany(rawProducts.map(p => ({
      ...p,
      seo: {
        title: `${p.name} - Resova`,
        description: p.description,
        slug: p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        keywords: [p.category.toLowerCase(), ...p.name.toLowerCase().split(' ')]
      }
    })));

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
          { product: products[21]._id, name: products[21].name, quantity: 1, price: products[21].price }
        ],
        totalAmount: products[0].price + products[21].price,
        status: 'delivered'
      },
      {
        restaurantId: restaurant._id,
        customerId: customerUser._id,
        items: [
          { product: products[3]._id, name: products[3].name, quantity: 2, price: products[3].price }
        ],
        totalAmount: products[3].price * 2,
        status: 'pending'
      }
    ]);

    console.log('=================================');
    console.log('✅ DATABASE FULLY SEEDED FOR SINGLE-TENANT');
    console.log('=================================');
    console.log('Test Accounts:');
    console.log('🧑‍💼 Resova Admin: admin@resova.com');
    console.log('🛒 Customer: customer@resova.com');
    console.log('🔑 Password (All): password123');
    console.log('=================================');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedDatabase();
