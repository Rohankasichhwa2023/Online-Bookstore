// src/pages/CheckoutPage.jsx

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const CheckoutPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { orderId, totalAmount } = location.state || {};

    const [isEsewaLoading, setEsewaLoading] = useState(false);
    const [isKhaltiLoading, setKhaltiLoading] = useState(false);
    const [esewaFormData, setEsewaFormData] = useState(null);

    // 1) Redirect to /cart if no orderId
    useEffect(() => {
        if (!orderId) {
            navigate('/cart');
        }
    }, [orderId, navigate]);

    // 2) When esewaFormData appears, build & submit the form
    useEffect(() => {
        if (!esewaFormData) return;

        const form = document.createElement('form');
        form.method = 'POST';
        form.action = 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';

        Object.entries(esewaFormData).forEach(([key, value]) => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = value;
            form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
    }, [esewaFormData]);

    if (!orderId) {
        // While useEffect above will redirect, render nothing in the meantime
        return null;
    }

    // Convert totalAmount (string) to number for calculations
    const amountInRupees = parseFloat(totalAmount);

    // Handler: eSewa
    const handleEsewa = async () => {
        setEsewaLoading(true);
        try {
            const res = await axios.post(
                'http://localhost:8000/orders/get-esewa-payment-data/',
                { order_id: orderId }
            );
            setEsewaFormData(res.data);
        } catch (error) {
            console.error('Error fetching eSewa data:', error);
            alert('Failed to get eSewa payment data. Please try again.');
            setEsewaLoading(false);
        }
    };

    // Handler: Khalti (Redirect flow)
    const handleKhalti = async () => {
        setKhaltiLoading(true);

        const payload = {
            return_url: `http://localhost:8000/orders/khalti/verify/?order_id=${orderId}`,
            purchase_order_id: `order-${orderId}`,
            purchase_order_name: `Order #${orderId}`,
            amount: Math.round(amountInRupees * 100), // convert rupees to paisa
        };

        try {
            const res = await axios.post(
                'http://localhost:8000/orders/khalti/initiate/',
                payload,
                { headers: { 'Content-Type': 'application/json' } }
            );

            if (res.data.payment_url) {
                window.location.href = res.data.payment_url;
            } else {
                console.error('Khalti initiation error:', res.data);
                alert('Unable to initiate Khalti payment. Please try again.');
                setKhaltiLoading(false);
            }
        } catch (err) {
            console.error('Khalti initiation error:', err.response || err);
            alert('Unable to initiate Khalti payment. Please try again.');
            setKhaltiLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Checkout — Order #{orderId}</h2>
            <p>
                <strong>Total Amount:</strong> Rs. {amountInRupees.toFixed(2)}
            </p>

            <div style={{ display: 'flex', gap: '16px', marginTop: '20px' }}>
                {/* eSewa Button */}
                <button
                    onClick={handleEsewa}
                    disabled={isEsewaLoading || isKhaltiLoading}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#28a745',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: isEsewaLoading || isKhaltiLoading ? 'not-allowed' : 'pointer',
                    }}
                >
                    {isEsewaLoading ? 'Redirecting to eSewa…' : 'Pay with eSewa'}
                </button>

                {/* Khalti Button */}
                <button
                    onClick={handleKhalti}
                    disabled={isEsewaLoading || isKhaltiLoading}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#6633cc',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: isEsewaLoading || isKhaltiLoading ? 'not-allowed' : 'pointer',
                    }}
                >
                    {isKhaltiLoading ? 'Redirecting to Khalti…' : 'Pay with Khalti'}
                </button>
            </div>
        </div>
    );
};

export default CheckoutPage;
