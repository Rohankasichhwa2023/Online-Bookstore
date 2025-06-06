import React from 'react';
import { useParams, Link } from 'react-router-dom';

const OrderFailPage = () => {
    const { orderId } = useParams();

    return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
            <h1>Payment Failed or Canceled</h1>
            <p>Your payment for order <strong>#{orderId}</strong> was not completed.</p>
            <p>If this was a mistake, you can try again or choose a different payment method.</p>
            <div style={{ marginTop: '20px' }}>
                <Link to="/cart" style={{
                    marginRight: '10px',
                    padding: '10px 20px',
                    backgroundColor: '#dc3545',
                    color: '#fff',
                    textDecoration: 'none',
                    borderRadius: '4px'
                }}>
                    Return to Cart
                </Link>
                <Link to={`/checkout`} state={{ orderId, totalAmount: null }} style={{
                    padding: '10px 20px',
                    backgroundColor: '#007bff',
                    color: '#fff',
                    textDecoration: 'none',
                    borderRadius: '4px'
                }}>
                    Retry Checkout
                </Link>
            </div>
        </div>
    );
};

export default OrderFailPage;
