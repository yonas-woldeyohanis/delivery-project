// src/data/mockData.js

export const restaurants = [
  { 
    id: 1, 
    name: 'Campus Cafe', 
    cuisine: 'Coffee & Snacks', 
    image: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=500&q=80' 
  },
  { 
    id: 2, 
    name: 'Student Burger Joint', 
    cuisine: 'Burgers & Fries', 
    image: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=500&q=80' 
  },
  { 
    id: 3, 
    name: 'Library Pizza', 
    cuisine: 'Pizza', 
    image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=500&q=80' 
  },
  {
    id: 4,
    name: 'Healthy Hall',
    cuisine: 'Salads & Smoothies',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&q=80'
  }
];
// src/data/mockData.js

// ... your existing 'restaurants' array should be above this ...

export const menus = {
  1: [ // Corresponds to Campus Cafe (id: 1)
    { id: 101, name: 'Espresso', price: 2.50 },
    { id: 102, name: 'Croissant', price: 3.00 },
    { id: 103, name: 'Club Sandwich', price: 5.50 },
  ],
  2: [ // Corresponds to Student Burger Joint (id: 2)
    { id: 201, name: 'Classic Burger', price: 6.00 },
    { id: 202, name: 'Cheese Burger', price: 6.50 },
    { id: 203, name: 'Fries', price: 2.00 },
  ],
  3: [ // Corresponds to Library Pizza (id: 3)
    { id: 301, name: 'Margherita Pizza', price: 8.00 },
    { id: 302, name: 'Pepperoni Pizza', price: 9.00 },
    { id: 303, name: 'Soda', price: 1.50 },
  ],
  4: [ // Corresponds to Healthy Hall (id: 4)
    { id: 401, name: 'Caesar Salad', price: 7.00 },
    { id: 402, name: 'Green Smoothie', price: 4.50 },
    { id: 403, name: 'Avocado Toast', price: 5.00 },
  ],
};

// We'll also add delivery agents now for a future step
export const deliveryAgents = [
    { id: 1, name: 'John D.', phone: '09987765', rating: 4.8 },
    { id: 2, name: 'Sarah P.',phone: '0925463322',  rating: 4.9 },
    { id: 3, name: 'Mike R.',phone: '0998675443', rating: 4.6 },
];
// Add this to src/data/mockData.js

export const orders = [
  {
    id: 'ORD-120495',
    customer: { name: 'Alice Smith', dorm: 'Block 22, Room 4' },
    date: '2023-10-27',
    total: 13.50,
    status: 'Delivered',
    items: [
      { name: 'Classic Burger', price: 6.00 },
      { name: 'Fries', price: 2.00 },
      { name: 'Soda', price: 1.50 },
    ]
  },
  {
    id: 'ORD-120496',
    customer: { name: 'Bob Johnson', dorm: 'Block 15, Room 11' },
    date: '2023-10-28',
    total: 9.50,
    status: 'Preparing',
    items: [
      { name: 'Margherita Pizza', price: 8.00 },
    ]
  },
  {
    id: 'ORD-120497',
    customer: { name: 'Charlie Brown', dorm: 'Block 34, Room 2' },
    date: '2023-10-28',
    total: 10.00,
    status: 'Out for Delivery',
    items: [
      { name: 'Caesar Salad', price: 7.00 },
      { name: 'Green Smoothie', price: 4.50 },
    ]
  }
];