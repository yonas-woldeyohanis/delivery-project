import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';

// --- Components ---
import AppNavbar from './components/AppNavbar.jsx';
import Footer from './components/Footer.jsx';
import RestaurantAdminLayout from './components/restaurantAdmin/RestaurantAdminLayout.jsx';
import RestaurantAdminRoute from './components/restaurantAdmin/RestaurantAdminRoute.jsx';
import SuperAdminRoute from './components/superAdmin/SuperAdminRoute.jsx';
import SuperAdminLayout from './components/superAdmin/SuperAdminLayout.jsx';
import AgentRoute from './components/agentAdmin/AgentRoute.jsx';
import AgentLayout from './components/agentAdmin/AgentLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx'; 
import AuthCallbackPage from './pages/AuthCallbackPage.jsx';

// --- Pages ---
import LandingPage from './pages/LandingPage.jsx';
import PortalPage from './pages/PortalPage.jsx';
// --- RESTORED: We are now using our original login/register pages ---
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import CartPage from './pages/CartPage.jsx'; 
import HomePage from './pages/HomePage.jsx';
import MenuPage from './pages/MenuPage.jsx';
import SelectAgentPage from './pages/SelectAgentPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import ConfirmationPage from './pages/ConfirmationPage.jsx';
import OrderHistoryPage from './pages/OrderHistoryPage.jsx';
import OrderDetailPage from './pages/OrderDetailPage.jsx';
import PickupCheckoutPage from './pages/PickupCheckoutPage.jsx';
import SelectPaymentPage from './pages/SelectPaymentPage.jsx';
import MyProfilePage from './pages/MyProfilePage.jsx';
import PaymentVerifyPage from './pages/PaymentVerifyPage.jsx';
// --- RESTORED: We need our original admin login pages again ---
import RestaurantAdminLoginPage from './pages/RestaurantAdminLoginPage.jsx';
import SuperAdminLoginPage from './pages/superAdmin/SuperAdminLoginPage.jsx';
import AgentLoginPage from './pages/AgentLoginPage.jsx';
import RestaurantDashboard from './pages/restaurantAdmin/RestaurantDashboard.jsx';
import RestaurantMenuPage from './pages/restaurantAdmin/RestaurantMenuPage.jsx';
import RestaurantOrdersPage from './pages/restaurantAdmin/RestaurantOrdersPage.jsx';
import SuperAdminDashboard from './pages/superAdmin/SuperAdminDashboard.jsx';
import ManageRestaurantsPage from './pages/superAdmin/ManageRestaurantsPage.jsx';
import ManageAgentsPage from './pages/superAdmin/ManageAgentsPage.jsx';
import ViewAllOrdersPage from './pages/superAdmin/ViewAllOrdersPage.jsx';
import AgentDashboardPage from './pages/agent/AgentDashboardPage.jsx';
import MyDeliveriesPage from './pages/agent/MyDeliveriesPage.jsx';
import RestaurantReviewsPage from './pages/restaurantAdmin/RestaurantReviewsPage'; 


function App() {
  const [cart, setCart] = useState([]);
  const [userInfo, setUserInfo] = useState(() => JSON.parse(localStorage.getItem('userInfo')));
  const navigate = useNavigate();
  const location = useLocation();

  const loginHandler = (data) => { 
    localStorage.setItem('userInfo', JSON.stringify(data)); 
    setUserInfo(data); 
    // After login, we now handle redirection based on role
    if (data.role === 'restaurantAdmin') {
      navigate('/restaurant-admin/dashboard');
    } else if (data.role === 'agent') {
      navigate('/agent-admin/dashboard');
    } else if (data.isAdmin) {
      navigate('/super-admin/dashboard');
    } else {
      navigate('/home');
    }
  };

  const logoutHandler = () => { 
    localStorage.removeItem('userInfo'); 
    setUserInfo(null); 
    setCart([]);
    window.location.href = '/login'; // Use a hard refresh for a clean logout
  };
  
  const handleUpdateUser = (updatedData) => {
    const updatedUserInfo = { ...userInfo, ...updatedData };
    localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
    setUserInfo(updatedUserInfo);
  };

  const addToCart = (item) => {
    const formattedItem = {
      name: item.name, price: item.price,
      product: item._id, restaurant: item.restaurantId,
    };
    setCart([...cart, formattedItem]);
  };
  
  const removeFromCart = (index) => setCart(cart.filter((_, i) => i !== index));
  const onClearCart = () => setCart([]);
  
  // (We no longer need the complex useEffect for redirection)

  const isAnyAdminRoute = location.pathname.startsWith('/restaurant-admin') || location.pathname.startsWith('/super-admin') || location.pathname.startsWith('/agent-admin');
  const isAuthRoute = location.pathname.endsWith('/login') || location.pathname === '/register';
  const showNavbar = !isAnyAdminRoute && !isAuthRoute && location.pathname !== '/';
  const showFooter = location.pathname === '/' || location.pathname.endsWith('/login') || location.pathname === '/register' || location.pathname === '/portal';

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      {showNavbar && (
        <AppNavbar cartCount={cart.length} userInfo={userInfo} onLogout={logoutHandler} />
      )}
      <main>
        <Routes>
          <Route path="/portal" element={<PortalPage />} />
          <Route path="/" element={userInfo ? <Navigate to="/home" /> : <LandingPage />} />
          
          {/* --- RESTORED: Using our original, reliable login/register routes --- */}
          <Route path="/login" element={<LoginPage onLogin={loginHandler} />} />
          <Route path="/register" element={<RegisterPage />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/restaurant/:id" element={<MenuPage handleAddToCart={addToCart} />} />
            <Route path="/history" element={<OrderHistoryPage />} />
            <Route path="/order/:id" element={<OrderDetailPage />} />
            <Route path="/profile" element={<MyProfilePage userInfo={userInfo} onUpdate={handleUpdateUser} />} />
            <Route path="/cart" element={<CartPage cart={cart} handleRemoveFromCart={removeFromCart} />} />
            <Route path="/select-agent" element={<SelectAgentPage />} />
            <Route path="/enter-delivery-info" element={<CheckoutPage cart={cart} handleRemoveFromCart={removeFromCart} />} />
            <Route path="/enter-pickup-info" element={<PickupCheckoutPage cart={cart} handleRemoveFromCart={removeFromCart} />} />
            <Route path="/select-payment" element={<SelectPaymentPage cart={cart} />} />
            <Route path="/confirmation" element={<ConfirmationPage />} />
            <Route path="/payment-verify" element={<PaymentVerifyPage onClearCart={onClearCart} />} />
          </Route>

          {/* --- RESTORED: Using our original, reliable admin login routes --- */}
          <Route path="/restaurant-admin/login" element={<RestaurantAdminLoginPage onLogin={loginHandler} />} />
          <Route path="/super-admin/login" element={<SuperAdminLoginPage onLogin={loginHandler} />} />
          <Route path="/agent-admin/login" element={<AgentLoginPage onLogin={loginHandler} />} />
          <Route 
        path="/auth/callback" 
        element={<AuthCallbackPage onLogin={loginHandler} />} 
      />
          
          <Route element={<RestaurantAdminRoute />}>
            <Route path="/restaurant-admin" element={<RestaurantAdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<RestaurantDashboard />} />
              <Route path="menu" element={<RestaurantMenuPage />} />
              <Route path="orders" element={<RestaurantOrdersPage />} />
               <Route path="reviews" element={<RestaurantReviewsPage />} />
            </Route>
          </Route>
          
          <Route element={<SuperAdminRoute />}>
            <Route path="/super-admin" element={<SuperAdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<SuperAdminDashboard />} />
              <Route path="restaurants" element={<ManageRestaurantsPage />} />
              <Route path="agents" element={<ManageAgentsPage />} />
              <Route path="orders" element={<ViewAllOrdersPage />} />
            </Route>
          </Route>
          
          <Route element={<AgentRoute />}>
            <Route path="/agent-admin" element={<AgentLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AgentDashboardPage />} />
              <Route path="deliveries" element={<MyDeliveriesPage />} />
              <Route path="profile" element={<MyProfilePage userInfo={userInfo} onUpdate={handleUpdateUser} />} />
            </Route>
          </Route>
        </Routes>
      </main>
      {showFooter && <Footer />}
    </>
  );
}

export default App;