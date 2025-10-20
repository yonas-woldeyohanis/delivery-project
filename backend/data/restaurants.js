// backend/data/restaurants.js
const restaurants = [
    {
        name: 'Yoni Pizza',
        cuisine: 'Italian',
        address: 'Block A, Campus Center',
        logo: '/uploads/pizza_logo.png',
        menu: [
            { name: 'Margherita Pizza', price: 8.99, category: 'Main' },
            { name: 'Pepperoni Pizza', price: 10.99, category: 'Main' },
            { name: 'Garlic Bread', price: 4.50, category: 'Starter' },
        ]
    },
    {
        name: 'Campus Burger',
        cuisine: 'American',
        address: 'Student Union, Floor 2',
        logo: '/uploads/burger_logo.png',
        menu: [
            { name: 'Classic Burger', price: 7.99, category: 'Main' },
            { name: 'Cheese Burger', price: 8.99, category: 'Main' },
            { name: 'Fries', price: 3.00, category: 'Side' },
        ]
    }
];

export default restaurants;