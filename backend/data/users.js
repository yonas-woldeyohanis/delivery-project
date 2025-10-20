// backend/data/users.js
import bcrypt from 'bcryptjs';

const users = [
  {
    name: 'Super Admin',
    email: 'superadmin@example.com',
    password: bcrypt.hashSync('123456', 10),
    isAdmin: true,
    role: 'customer', // Super Admin is also a base user
  },
  {
    name: 'Alice Customer',
    email: 'alice@example.com',
    password: bcrypt.hashSync('123456', 10),
    role: 'customer',
  },
  {
    name: 'Yoni Restaurant Admin',
    email: 'yoni@example.com',
    password: bcrypt.hashSync('123456', 10),
    role: 'restaurantAdmin',
  },
  {
    name: 'Besu Delivery Agent',
    email: 'besu.agent@example.com',
    password: bcrypt.hashSync('123456', 10),
    role: 'agent',
  },
];

export default users;