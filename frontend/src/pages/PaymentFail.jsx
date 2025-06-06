// src/pages/PaymentFail.jsx
import React from 'react';
import { useParams } from 'react-router-dom';

const PaymentFail = () => {
    const { id } = useParams(); // orderId

    return (
        <div style={{ padding: '20px' }}>
            <h2>Payment Failed or Canceled</h2>
            <p>Your payment for Order #{id} could not be completed.</p>
            <p>Please try again or contact support if you need help.</p>
        </div>
    );
};

export default PaymentFail;
