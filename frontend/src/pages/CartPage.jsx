import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const CartPage = () => {
    const navigate = useNavigate();
    const { updateCart } = useCart();
    const [user] = useState(() => JSON.parse(localStorage.getItem('user')));
    const [items, setItems] = useState([]);

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
                params: { user_id: user.id }
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
                book_id: bookId
            });
            const res = await axios.get('http://localhost:8000/carts/view-cart/', {
                params: { user_id: user.id }
            });
            setItems(res.data);
            await updateCart(); // update global count now that one was removed
        } catch (err) {
            console.error('Error removing item:', err);
        }
    };

    const changeQuantity = async (bookId, newQty) => {
        try {
            await axios.put('http://localhost:8000/carts/update-item/', {
                user_id: user.id,
                book_id: bookId,
                quantity: newQty
            });
            const updatedItems = newQty > 0
                ? items.map(it =>
                    it.book.id === bookId
                        ? { ...it, quantity: newQty, subtotal: it.book.price_snapshot * newQty }
                        : it
                )
                : items.filter(it => it.book.id !== bookId);
            setItems(updatedItems);
            await updateCart(); // update global count (in case newQty = 0 removes it)
        } catch (err) {
            console.error('Error updating quantity:', err);
        }
    };

    return (
        <div>
            <h2>{user.username}’s Cart</h2>

            {items.length === 0 ? (
                <p>Your cart is empty.</p>
            ) : (
                <div>
                    {items.map(it => (
                        <div
                            key={it.id}
                            style={{ border: '1px solid black', marginBottom: '10px', padding: '10px' }}
                        >
                            <img
                                src={it.book.cover_image}
                                alt={it.book.title}
                                style={{
                                    width: '80px',
                                    height: '100px',
                                    objectFit: 'cover',
                                    marginRight: '16px'
                                }}
                            />
                            <div>
                                <h4>{it.book.title}</h4>
                                <p>Qty: {it.quantity}</p>
                                <p>Unit Price: Rs. {it.book.price_snapshot}</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <button onClick={() => changeQuantity(it.book.id, it.quantity - 1)}>–</button>
                                    <span>{it.quantity}</span>
                                    <button onClick={() => changeQuantity(it.book.id, it.quantity + 1)}>+</button>
                                </div>
                                <p>Subtotal: Rs. {it.subtotal.toFixed(2)}</p>
                                <button onClick={() => removeFromCart(it.book.id)}>Remove</button>
                            </div>
                        </div>
                    ))}
                    <h3>Total: Rs. {total}</h3>
                </div>
            )}
        </div>
    );
};

export default CartPage;
