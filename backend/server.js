import path from 'path';
import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';

// --- 1. IMPORT PASSPORT AND SESSION PACKAGES ---
import session from 'express-session';
import passport from 'passport';
// --- 2. IMPORT OUR PASSPORT CONFIGURATION FILE ---
import configurePassport from './config/passport.js';

// --- Import Route Files ---
import createOrderRoutes from './routes/orderRoutes.js'; 
import paymentRoutes from './routes/paymentRoutes.js';
import restaurantRoutes from './routes/restaurantRoutes.js';
import seedRoutes from './routes/seedRoutes.js';
import userRoutes from './routes/userRoutes.js';
import agentRoutes from './routes/agentRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import authRoutes from './routes/authRoutes.js'; // The new Google auth routes

// --- INITIAL SETUP ---
dotenv.config();
const app = express();

// --- 3. INITIALIZE PASSPORT ---
// This must be done BEFORE it is used.
configurePassport(passport);

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

const allowedOrigins = [
  'https://campusdeliveryweb.netlify.app', // Your deployed Netlify site
  'http://localhost:5173'                 // Your local development environment
];

// --- 4. ADD SESSION & PASSPORT MIDDLEWARE TO THE APP ---
// This must come BEFORE your API routes.
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// --- Static folder for uploads ---
const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// --- WEBSOCKET & SERVER SETUP ---
const server = http.createServer(app); 
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: allowedOrigins, // Use the same array of allowed origins
    credentials: true       // It's good practice to include this
  },
});

// --- API ROUTES ---
app.use('/api/orders', createOrderRoutes(io)); // Pass 'io' to order routes
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/seed', seedRoutes);
app.use('/api/users', userRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/auth', authRoutes); // Use the new Google auth routes

app.get('/', (req, res) => {
  res.send('API is running...');
});

// --- WEBSOCKET CONNECTION LISTENER ---
io.on("connection", (socket) => {
  console.log("A user connected to WebSocket");

  socket.on("joinOrderRoom", (orderId) => {
    socket.join(orderId);
    console.log(`User joined room: ${orderId}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// --- SERVER AND DATABASE STARTUP ---
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');

    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  }
};

// --- RUN THE SERVER ---
startServer();