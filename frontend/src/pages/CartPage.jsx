// src/pages/CartPage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import UserLogoutButton from '../components/UserLogoutButton';

const CartPage = () => {
    const navigate = useNavigate();
    const User = JSON.parse(localStorage.getItem('user'));
    const [items, setItems] = useState([]);

    useEffect(() => {
        if (!User) return navigate('/login');
        fetchCart();
    }, [User, navigate]);

    const fetchCart = async () => {
        const res = await axios.get('http://localhost:8000/carts/view-cart/', {
            params: { user_id: User.id }
        });
        setItems(res.data);
    };

    const total = items.reduce((sum, it) => sum + it.subtotal, 0).toFixed(2);

    if (!User) return null;

    const removeFromCart = async (bookId) => {
        try {
            await axios.post('http://localhost:8000/carts/removeitem-cart/', {
                user_id: User.id,
                book_id: bookId
            });
            fetchCart(); // Refresh cart after removal
        } catch (err) {
            console.error('Error removing item:', err);
        }
    };

    return (
        <div>
            <h2>{User.username}’s Cart</h2>
            <UserLogoutButton />
            <br />
            {items.length === 0
                ? <p>Your cart is empty.</p>
                : (
                    <div>
                        {items.map(it => (
                            <div key={it.id} style={{
                                border: '1px solid black'
                            }}>
                                <img src={it.book.cover_image} alt={it.book.title}
                                    style={{ width: '80px', height: '100px', objectFit: 'cover', marginRight: '16px' }} />
                                <div>
                                    <h4>{it.book.title}</h4>
                                    <p>Qty: {it.quantity}</p>
                                    <p>Unit Price: Rs. {it.book.price_snapshot}</p>
                                    <p>Subtotal: Rs. {it.subtotal.toFixed(2)}</p>
                                    <button onClick={() => removeFromCart(it.book.id)}>Remove</button>
                                </div>
                            </div>
                        ))}
                        <h3>Total: Rs. {total}</h3>
                    </div>
                )
            }
        </div>
    );
};

export default CartPage;
