import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const CheckoutPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { orderId } = location.state || {};

    const [formData, setFormData] = useState(null);

    useEffect(() => {
        if (!orderId) {
            navigate('/cart');
            return;
        }

        async function fetchPaymentData() {
            try {
                const res = await axios.post('http://localhost:8000/orders/get-esewa-payment-data/', { order_id: orderId });
                setFormData(res.data);
            } catch (error) {
                console.error('Error fetching payment data:', error);
                alert('Failed to get payment data. Please try again.');
                navigate('/cart');
            }
        }

        fetchPaymentData();
    }, [orderId, navigate]);

    useEffect(() => {
        if (formData) {
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';

            for (const [key, value] of Object.entries(formData)) {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = value;
                form.appendChild(input);
            }

            document.body.appendChild(form);
            form.submit();
        }
    }, [formData]);

    return (
        <div style={{ padding: '20px' }}>
            <h2>Redirecting to eSewa for Payment…</h2>
            <p>If you are not automatically redirected, <button onClick={() => window.location.reload()}>click here</button>.</p>
        </div>
    );
};

export default CheckoutPage;
