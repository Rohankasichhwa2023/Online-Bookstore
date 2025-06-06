// src/pages/CartPage.jsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const CartPage = () => {
    const navigate = useNavigate();
    const { updateCart } = useCart();
    const [user] = useState(() => JSON.parse(localStorage.getItem('user')));
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchCart();
        updateCart(); // immediately fetch the global count for this user
    }, [navigate, user, updateCart]);

    const fetchCart = async () => {
        try {
            const res = await axios.get('http://localhost:8000/carts/view-cart/', {
                params: { user_id: user.id },
            });
            setItems(res.data);
        } catch (err) {
            console.error('Error fetching cart:', err);
        }
    };

    const total = items.reduce((sum, it) => sum + it.subtotal, 0).toFixed(2);

    if (!user) return null;

    const removeFromCart = async (bookId) => {
        try {
            await axios.post('http://localhost:8000/carts/removeitem-cart/', {
                user_id: user.id,
                book_id: bookId,
            });
            const res = await axios.get('http://localhost:8000/carts/view-cart/', {
                params: { user_id: user.id },
            });
            setItems(res.data);
            await updateCart(); // update global count now that one was removed
        } catch (err) {
            console.error('Error removing item:', err);
        }
    };

    const changeQuantity = async (bookId, newQty) => {
        if (newQty < 1) return;
        try {
            await axios.put('http://localhost:8000/carts/update-item/', {
                user_id: user.id,
                book_id: bookId,
                quantity: newQty,
            });
            const updatedItems = items.map((it) =>
                it.book.id === bookId
                    ? { ...it, quantity: newQty, subtotal: it.book.price_snapshot * newQty }
                    : it
            );
            setItems(updatedItems);
            await updateCart(); // update global count (in case newQty = 0 removes it)
        } catch (err) {
            console.error('Error updating quantity:', err);
        }
    };

    const createOrderAndNavigate = async (paymentMethod) => {
        setLoading(true);
        try {
            // 1) Create order with specified payment method
            const res = await axios.post(
                'http://localhost:8000/orders/create/',
                {
                    user_id: user.id,
                    payment_method: paymentMethod,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
            const { order_id, total_amount } = res.data;

            // 2) Navigate to Checkout page, passing orderId, totalAmount, and paymentMethod
            navigate('/checkout', {
                state: {
                    orderId: order_id,
                    totalAmount: total_amount,
                    paymentMethod,
                },
            });
        } catch (err) {
            console.error('Error creating order:', err.response || err);
            alert('Failed to create order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>{user.username}’s Cart</h2>

            {items.length === 0 ? (
                <p>Your cart is empty.</p>
            ) : (
                <div>
                    {items.map((it) => (
                        <div
                            key={it.id}
                            style={{
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                marginBottom: '10px',
                                padding: '10px',
                                display: 'flex',
                                gap: '16px',
                            }}
                        >
                            <img
                                src={it.book.cover_image}
                                alt={it.book.title}
                                style={{
                                    width: '80px',
                                    height: '100px',
                                    objectFit: 'cover',
                                }}
                            />
                            <div style={{ flexGrow: 1 }}>
                                <h4>{it.book.title}</h4>
                                <p>
                                    <strong>Qty:</strong> {it.quantity}
                                </p>
                                <p>
                                    <strong>Unit Price:</strong> Rs. {it.book.price_snapshot}
                                </p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <button
                                        onClick={() => changeQuantity(it.book.id, it.quantity - 1)}
                                        disabled={it.quantity <= 1}
                                    >
                                        –
                                    </button>
                                    <span>{it.quantity}</span>
                                    <button onClick={() => changeQuantity(it.book.id, it.quantity + 1)}>+</button>
                                </div>
                                <p>
                                    <strong>Subtotal:</strong> Rs. {it.subtotal.toFixed(2)}
                                </p>
                                <button
                                    onClick={() => removeFromCart(it.book.id)}
                                    style={{
                                        background: 'red',
                                        color: 'white',
                                        border: 'none',
                                        padding: '6px 12px',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}
                    <h3>Total: Rs. {total}</h3>

                    <div style={{ marginTop: '20px', display: 'flex', gap: '16px' }}>
                        <button
                            onClick={() => createOrderAndNavigate('esewa')}
                            disabled={loading}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#28a745',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                            }}
                        >
                            {loading ? 'Processing…' : 'Checkout with eSewa'}
                        </button>

                        <button
                            onClick={() => createOrderAndNavigate('khalti')}
                            disabled={loading}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#6633cc',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                            }}
                        >
                            {loading ? 'Processing…' : 'Checkout with Khalti'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartPage;
