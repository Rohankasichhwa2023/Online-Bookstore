import React from 'react';
import { useParams, Link } from 'react-router-dom';

const OrderSuccessPage = () => {
    const { orderId } = useParams();

    return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
            <h1>Payment Successful!</h1>
            <p>Your order <strong>#{orderId}</strong> has been paid successfully via Khalti.</p>
            <p>Thank you for your purchase. You can view your order details below:</p>
            <Link to={`/shop`} style={{
                display: 'inline-block',
                marginTop: '20px',
                padding: '10px 20px',
                backgroundColor: '#28a745',
                color: '#fff',
                textDecoration: 'none',
                borderRadius: '4px'
            }}>
                Shop More Books
            </Link>
        </div>
    );
};

export default OrderSuccessPage;
