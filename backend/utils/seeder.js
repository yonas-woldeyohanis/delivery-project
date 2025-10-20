// backend/utils/seeder.js
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { restaurants, menus } from '../../campus-delivery-react/src/data/mockData.js';
import Restaurant from '../models/restaurantModel.js';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Seeding...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

const importData = async () => {
  try {
    // Clear existing restaurants to avoid duplicates
    await Restaurant.deleteMany();
    console.log('Old data cleared...');

    // Combine restaurants with their menus
    const restaurantsWithMenus = restaurants.map(restaurant => {
      return {
        ...restaurant,
        menu: menus[restaurant.id] || []
      };
    });

    // Insert the combined data into the database
    await Restaurant.insertMany(restaurantsWithMenus);
    console.log('Data Imported Successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error with data import: ${error}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Restaurant.deleteMany();
    console.log('Data Destroyed Successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error with data destruction: ${error}`);
    process.exit(1);
  }
};

// Connect to DB first, then decide what to do
connectDB().then(() => {
  // Check command line arguments to decide whether to import or destroy
  if (process.argv[2] === '-d') {
    destroyData();
  } else {
    importData();
  }
});