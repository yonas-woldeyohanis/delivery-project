// backend/routes/seedRoutes.js
import express from 'express';
import Restaurant from '../models/restaurantModel.js';
import { restaurants, menus } from '../../campus-delivery-react/src/data/mockData.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    await Restaurant.deleteMany({});
    console.log('Old restaurant data cleared.');

    const restaurantsWithMenus = restaurants.map(restaurant => ({
      ...restaurant,
      menu: menus[restaurant.id] || []
    }));

    const createdRestaurants = await Restaurant.insertMany(restaurantsWithMenus);
    console.log('Data seeded successfully!');
    res.send({ message: 'Database seeded successfully!', createdRestaurants });
  } catch (error) {
    console.error('Error seeding data:', error);
    res.status(500).send({ message: 'Error seeding data' });
  }
});

export default router;