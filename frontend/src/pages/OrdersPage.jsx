import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const OrdersPage = () => {
    const navigate = useNavigate();
    const user = useMemo(() => JSON.parse(localStorage.getItem('user') || 'null'), []);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        (async () => {
            setLoading(true);
            try {
                const res = await axios.get('http://localhost:8000/orders/list/', {
                    params: { user_id: user.id },
                });
                console.log("Orders Response:", res.data);
                setOrders(res.data);
            } catch (err) {
                console.error('Error fetching orders:', err);
                setError('Unable to load orders.');
            } finally {
                setLoading(false);
            }
        })();
    }, [navigate, user]);

    const handleEsewaPayNow = async (orderId) => {
        try {
            const res = await axios.post(
                'http://localhost:8000/orders/get-esewa-payment-data/',
                { order_id: orderId }
            );
            const formData = res.data;
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';
            Object.entries(formData).forEach(([key, value]) => {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = value;
                form.appendChild(input);
            });
            document.body.appendChild(form);
            form.submit();
        } catch (err) {
            console.error('Pay Now (eSewa) error:', err);
            alert('Unable to initiate eSewa payment. Please try again.');
        }
    };

    const handleKhaltiPayNow = async (orderId) => {
        try {
            const res = await axios.get(
                `http://localhost:8000/orders/khalti/pay-now/${orderId}/`
            );
            if (res.data.payment_url) {
                window.location.href = res.data.payment_url;
            } else {
                alert('Unable to initiate Khalti payment. Please try again.');
            }
        } catch (err) {
            console.error('Pay Now (Khalti) error:', err);
            alert('Unable to initiate Khalti payment. Please try again.');
        }
    };

    if (!user) return null;

    if (loading) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <h3>Loading your orders…</h3>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
                <h3>{error}</h3>
            </div>
        );
    }

    return (
        <>
            <div style={{ padding: '20px' }}>
                <h2>{user.username}’s Orders</h2>
                {orders.length === 0 ? (
                    <p>You have not placed any orders yet.</p>
                ) : (
                    orders.map((order) => (
                        <div key={order.id} style={orderCardStyle}>
                            <div style={orderHeaderStyle}>
                                <div><strong>Order ID:</strong> {order.id}</div>
                                <div><strong>Date:</strong> {new Date(order.order_date).toLocaleString()}</div>
                                <div><strong>Shipping Address:</strong>{order.address
                                    ? `${order.address.address_line}, ${order.address.city}`
                                    : 'No shipping address provided'}</div>
                                <div><strong>Status:</strong> {capitalize(order.status)}</div>
                                <div><strong>Payment Method:</strong> {capitalize(order.payment_method)}</div>
                                <div><strong>Payment Status:</strong> {capitalize(order.payment_status)}</div>
                                <div><strong>Total Amount:</strong> Rs. {order.total_amount}</div>
                                {order.payment_status === 'pending' && (
                                    <div>
                                        {order.payment_method === 'esewa' ? (
                                            <button
                                                onClick={() => handleEsewaPayNow(order.id)}
                                                style={payNowButtonStyle}
                                            >
                                                Pay with eSewa
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleKhaltiPayNow(order.id)}
                                                style={payNowButtonStyle}
                                            >
                                                Pay with Khalti
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div style={itemsContainerStyle}>
                                {order.items.map((item, idx) => (
                                    <div key={idx} style={itemCardStyle}>
                                        <img
                                            src={`http://localhost:8000${item.book.cover_image}`}
                                            alt={item.book.title}
                                            style={itemImageStyle}
                                        />

                                        <div style={itemInfoStyle}>
                                            <div style={{ fontWeight: 'bold' }}>{item.book.title}</div>
                                            <div>Qty: {item.quantity}</div>
                                            <div>Unit Price: Rs. {item.price}</div>
                                            <div>Total: Rs. {Number(item.price) * item.quantity}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </>
    );
};

// Styles
const orderCardStyle = {
    border: '1px solid #ccc',
    borderRadius: '6px',
    padding: '16px',
    marginBottom: '24px',
    backgroundColor: '#fafafa',
};

const orderHeaderStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
    alignItems: 'center',
    marginBottom: '12px',
};

const itemsContainerStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
};

const itemCardStyle = {
    display: 'flex',
    border: '1px solid #ddd',
    borderRadius: '4px',
    overflow: 'hidden',
    width: '280px',
    backgroundColor: '#fff',
};

const itemImageStyle = {
    width: '80px',
    height: '100px',
    objectFit: 'cover',
};

const itemInfoStyle = {
    padding: '8px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
};

const payNowButtonStyle = {
    padding: '8px 16px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
};

function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export default OrdersPage;
