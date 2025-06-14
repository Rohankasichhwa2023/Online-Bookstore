import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../css/CheckoutPage.css";

const CheckoutPage = () => {

    const location = useLocation();
    const navigate = useNavigate();
    const { orderId, totalAmount } = location.state || {};

    const [isEsewaLoading, setEsewaLoading] = useState(false);
    const [isKhaltiLoading, setKhaltiLoading] = useState(false);

    const [defaultAddress, setDefaultAddress] = useState(null);
    const [addressError, setAddressError] = useState('');
    const user = JSON.parse(localStorage.getItem('user'));

    // redirect if no order
    useEffect(() => {
        if (!orderId) navigate('/cart');
    }, [orderId, navigate]);

    // fetch default address
    useEffect(() => {

        if (!user) return;

        axios.get('http://localhost:8000/users/addresses/', {
            params: { user_id: user.id }
        })
            .then(res => {
                const def = res.data.find(addr => addr.is_default);
                if (def) {
                    setDefaultAddress(def);
                    setAddressError('');
                } else {
                    setAddressError('No default address set. Please pick one.');
                }
            })
            .catch(err => {
                console.error(err);
                setAddressError('Could not load address.');
            });
    }, []);

    useEffect(() => {
        if (!defaultAddress || !orderId) return;

        // PATCH the order so that shipping_address gets updated
        axios.put(
            `http://localhost:8000/orders/change-address/${orderId}/`,
            { user_id: user.id }
        )
            .then(res => {
                console.log('Order address updated:', res.data.shipping_address);
            })
            .catch(err => {
                console.error('Failed to update order address:', err);
            });
    }, [defaultAddress, orderId]);


    if (!orderId) return null;

    const amountInRupees = parseFloat(totalAmount);

    // … inside handleEsewa() …
    const handleEsewa = async () => {
        setEsewaLoading(true);
        try {
            const res = await axios.post(
                'http://localhost:8000/orders/get-esewa-payment-data/',
                { order_id: orderId }
            );
            // build & submit form:
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';
            Object.entries(res.data).forEach(([k, v]) => {
                const inp = document.createElement('input');
                inp.type = 'hidden';
                inp.name = k;
                inp.value = v;
                form.appendChild(inp);
            });
            document.body.appendChild(form);
            form.submit();
        } catch (err) {
            alert('Failed to get eSewa data');
            setEsewaLoading(false);
        }
    };


    const handleKhalti = async () => {
        setKhaltiLoading(true);
        const payload = {
            return_url: `http://localhost:8000/orders/khalti/verify/?order_id=${orderId}`,
            purchase_order_id: `order-${orderId}`,
            purchase_order_name: `Order #${orderId}`,
            amount: Math.round(amountInRupees * 100),
            order_id: orderId,
        };
        try {
            const res = await axios.post(
                'http://localhost:8000/orders/khalti/initiate/',
                payload,
                { headers: { 'Content-Type': 'application/json' } }
            );
            if (res.data.payment_url) window.location.href = res.data.payment_url;
            else throw new Error('No payment_url');
        } catch {
            alert('Unable to initiate Khalti payment. Please try again.');
            setKhaltiLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="checkout-container">
                <div className="checkout-details">

                    <h3 style={{ marginBottom: "24px", color: "#0E4783" }}>
                        Order #{orderId}
                    </h3>

                    <div className="checkout-address">
                        <h4 style={{color: "#0E4783"}}>Shipping Address</h4>
                        {defaultAddress
                            ? (
                                <div style={{ lineHeight: 1.8 }}>
                                    {defaultAddress.full_name}<br />
                                    {defaultAddress.address_line}<br />
                                    {defaultAddress.city}, {defaultAddress.postal_code}<br />
                                    {defaultAddress.phone}
                                </div>
                            )
                            : <p style={{ color: 'red' }}>{addressError}</p>
                        }
                        <button
                            className="change-address-btn"
                            onClick={() => navigate('/address')}
                        >
                            Change Shipping Address
                        </button>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px" }}>
                        <h4 style={{ color: "#0E4783", margin: 0 }}>Total</h4>
                        <p className="price2">Rs {amountInRupees.toFixed(2)}</p>
                    </div>

                    <div style={{ display: "flex", gap: "24px"}}>
                        <button
                            onClick={handleEsewa}
                            disabled={isEsewaLoading || isKhaltiLoading}
                            style={{
                                width: '100%',
                                padding: '8px 24px',
                                backgroundColor: '#28a745',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: isEsewaLoading || isKhaltiLoading ? 'not-allowed' : 'pointer',
                            }}
                        >
                            {isEsewaLoading ? 'Redirecting to eSewa…' : 'Pay with eSewa'}
                        </button>

                        <button
                            onClick={handleKhalti}
                            disabled={isEsewaLoading || isKhaltiLoading}
                            style={{
                                width: '100%',
                                padding: '8px 24px',
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
            </div>
            <Footer />
        </>
    );
};

export default CheckoutPage;
