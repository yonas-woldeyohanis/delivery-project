import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import API_BASE_URL from '../config'; // Ensure this path is correct for this file

const LoadingSpinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', backgroundColor: '#0f172a', color: 'white' }}>
    <div className="spinner-detail" style={{width: '60px', height: '60px'}}></div>
    <h2 style={{marginTop: '1.5rem'}}>Verifying Your Payment...</h2>
    <p>Please do not close this page.</p>
  </div>
);

function PaymentVerifyPage({ onClearCart }) {
  const navigate = useNavigate();
  // We don't need verificationStatus state, as we navigate away immediately on success or failure.

  useEffect(() => {
    const verifyAndCreateOrder = async () => {
      try {
        // --- SAFETY CHECK #1: Ensure userInfo exists ---
        const userInfoString = localStorage.getItem('userInfo');
        if (!userInfoString) {
          // If the user isn't logged in, we can't proceed.
          throw new Error('You must be logged in to verify a payment.');
        }
        const userInfo = JSON.parse(userInfoString);
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

        // --- SAFETY CHECK #2: Ensure a pending order exists ---
        const pendingOrderString = localStorage.getItem('pendingOrder');
        if (!pendingOrderString) {
          throw new Error('No pending order found in your session. Your cart has been saved.');
        }
        const pendingOrder = JSON.parse(pendingOrderString);
        
        // This tx_ref is critical. If it's missing, we can't verify.
        if (!pendingOrder.tx_ref) {
            throw new Error('Transaction reference not found in pending order.');
        }

        const toastId = toast.loading('Verifying payment with Chapa...');

        // 2. Ask our backend to verify the transaction with Chapa
        const { data: verificationResult } = await axios.get(`${API_BASE_URL}/api/payment/verify-chapa/${pendingOrder.tx_ref}`, config);
        
        if (verificationResult.status !== 'success') {
          throw new Error('Payment verification failed. Please contact support.');
        }
        
        toast.loading('Payment confirmed. Placing your order...', { id: toastId });

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
          serviceFee: costDetails.serviceFee,
          deliveryFee: costDetails.deliveryFee,
          totalPrice: costDetails.totalCost,
          deliveryAgent: selectedAgent ? selectedAgent._id : null,
          isPaid: true,
          paidAt: new Date(),
        };

        const { data: createdOrder } = await axios.post(`${API_BASE_URL}/api/orders`, orderData, config);

        // 4. Cleanup and Redirect
        localStorage.removeItem('pendingOrder');
        onClearCart();
        toast.success('Payment successful! Your order has been placed.', { id: toastId });
        navigate('/confirmation', { replace: true, state: { order: createdOrder } });

      } catch (err) {
        // This will now catch any error, including missing localStorage items
        console.error("Payment Verification Error:", err); // Log the full error for debugging
        const message = err.response?.data?.message || err.message || 'An unknown error occurred.';
        toast.error(message);
        // Redirect back to the cart so the user can try again
        navigate('/cart', { replace: true });
      }
    };

    // The timeout gives localStorage a brief moment to sync, which can help in some edge cases.
    setTimeout(verifyAndCreateOrder, 100); 

  }, [navigate, onClearCart]);

  return <LoadingSpinner />;
}

export default PaymentVerifyPage;