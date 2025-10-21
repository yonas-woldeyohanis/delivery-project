import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import API_BASE_URL from '../config';

// Simple loading UI
const LoadingSpinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', backgroundColor: '#0f172a', color: 'white' }}>
    <div className="spinner-detail" style={{width: '60px', height: '60px'}}></div>
    <h2 style={{marginTop: '1.5rem'}}>Verifying Your Payment...</h2>
    <p>Please do not close this page.</p>
  </div>
);

function PaymentVerifyPage({ onClearCart }) {
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState('pending'); // 'pending', 'success', 'failed'

  useEffect(() => {
    const verifyAndCreateOrder = async () => {
      try {
        // 1. Get the pending order data we saved before redirecting to Chapa
        const pendingOrderString = localStorage.getItem('pendingOrder');
        if (!pendingOrderString) {
          throw new Error('No pending order found.');
        }
        const pendingOrder = JSON.parse(pendingOrderString);

        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

        // 2. Ask our backend to verify the transaction with Chapa
        const { data: verificationResult } = await axios.get(`${API_BASE_URL}/api/payment/verify-chapa/${pendingOrder.tx_ref}`, config);
        
        if (verificationResult.status !== 'success') {
          throw new Error('Payment verification failed. Please contact support.');
        }

        // 3. If verification is successful, create the order in our database
        const { cart, selectedAgent, shippingAddress, deliveryType, costDetails } = pendingOrder;
        const orderData = {
          restaurant: cart[0].restaurant,
          orderItems: cart.map(item => ({ name: item.name, price: item.price, product: item.product })),
          shippingAddress: {
            address: `${shippingAddress.fullName}, ${shippingAddress.dorm}`,
            city: 'On-Campus', postalCode: '00000', phone: shippingAddress.phone,
            isPickup: deliveryType === 'pickup'
          },
          paymentMethod: 'Chapa',
          itemsPrice: costDetails.itemsPrice,
          serviceFee: costDetails.serviceFee, // We now save the detailed fees
          deliveryFee: costDetails.deliveryFee, // Add this field to your backend orderModel if you want to store it
          totalPrice: costDetails.totalCost,
          deliveryAgent: selectedAgent ? selectedAgent._id : null,
          isPaid: true, // Mark the order as paid
          paidAt: new Date(),
        };

        const { data: createdOrder } = await axios.post(`${API_BASE_URL}/api/orders`, orderData, config);

        // 4. Cleanup and Redirect
        localStorage.removeItem('pendingOrder');
        onClearCart();
        setVerificationStatus('success');
        toast.success('Payment successful! Your order has been placed.');
        navigate('/confirmation', { replace: true, state: { order: createdOrder } });

      } catch (err) {
        setVerificationStatus('failed');
        const message = err.message || 'An unknown error occurred.';
        toast.error(message);
        // Redirect back to the cart so the user can try again
        navigate('/cart');
      }
    };

    verifyAndCreateOrder();
  }, [navigate, onClearCart]);

  return <LoadingSpinner />;
}

export default PaymentVerifyPage;