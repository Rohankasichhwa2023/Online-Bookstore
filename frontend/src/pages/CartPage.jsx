import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../css/CartPage.css';

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
        updateCart();
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
            await updateCart();
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
            await updateCart();
        } catch (err) {
            console.error('Error updating quantity:', err);
        }
    };

    const createOrderAndNavigate = async (paymentMethod) => {
        setLoading(true);
        try {
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
        <>
            <Navbar />
            <div className="cart-container">
                {items.length === 0 ? (
                    <div className="empty-cart">
                        <p>Your cart is empty.</p>
                        <button className="explore-books-btn" onClick={() => navigate('/shop')}><div>Explore books</div><div><img src="/icons/explore-white.png" className="icon-explore" /></div></button>
                    </div>
                ) : (
                    <div className="filled-cart">
                        <div className="left-side">
                            <h1 style={{ margin: "0px", padding: "0px 0px 24px 0px", fontSize: "24px", borderBottom: "2px solid #ccc" }}>My Bag</h1>
                            {items.map((it) => (
                                <div key={it.id} className="cart-item">
                                    <img src={it.book.cover_image} alt={it.book.title} className="cover" onClick={() => navigate(`/book/${it.book.id}`)} />
                                    <div className="cart-details">
                                        <div>
                                            <div onClick={() => navigate(`/book/${it.book.id}`)}>
                                                <p className="price">Rs {it.subtotal.toFixed(2)}</p>
                                                <p className="title">{it.book.title}</p>
                                                <p className="author">{it.book.author}</p>
                                                <div className="book-info"><h3>Genre</h3><p>{(it.book.genre || []).join(', ')}</p></div>
                                                <div className="book-info"><h3>Language</h3><p>{it.book.language}</p></div>
                                                <div className="book-info"><h3>Pages</h3><p>{it.book.pages}</p></div>
                                                <div className="book-info"><h3>Age Group</h3><p>{it.book.age_group}</p></div>
                                            </div>
                                            <p style={{ color: it.book.in_stock ? '#4CAF50' : '#E74242', marginTop: "16px" }}>
                                                {it.book.in_stock ? 'In Stock' : 'Out of Stock'} <span>({it.book.book_stock})</span>
                                            </p>
                                            <div className="cart-quantity">
                                                <button className="plus-minus-btn" onClick={() => changeQuantity(it.book.id, it.quantity - 1)} disabled={it.quantity <= 1}><img src="/icons/minus.png" className="icon2" /></button>
                                                <span>{it.book.in_stock ? it.quantity : 0}</span>
                                                <button className="plus-minus-btn" onClick={() => changeQuantity(it.book.id, it.quantity + 1)} disabled={it.quantity >= it.book.book_stock}><img src="/icons/plus.png" className="icon2" /></button>
                                            </div>
                                        </div>
                                        <button className="close-btn" onClick={() => removeFromCart(it.book.id)}><img src="/icons/close.png" className="icon2" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="right-side">
                            <h1 style={{ margin: "0px", padding: "0px 0px 24px 0px", fontSize: "24px", borderBottom: "2px solid #ccc" }}>Order Summary</h1>
                            
                            <div style={{margin: "24px 0px", width: "360px"}}>
                                {items.map((it) => (
                                    <div key={it.id} style={{margin:"0px", padding:"0px"}}>
                                        <div style={{display: "flex", justifyContent: "space-between"}}>   
                                            <p style={{padding: "0px", margin: "2px", fontSize: "16px"}}>{it.book.title}</p>
                                            <p style={{padding: "0px", margin: "2px",  fontWeight: "500"}}>Rs {it.subtotal.toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="total" style={{borderTop: "2px solid #ccc" }}><h4 style={{color: "#0E4783", margin: "0px"}}>Total</h4><p className="price2">Rs {total}</p></div>

                            <div className="checkout-buttons">
                                <button
                                    onClick={() => createOrderAndNavigate('esewa')}
                                    disabled={loading}
                                    className={`checkout-btn checkout-esewa`}
                                    style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
                                >
                                    {loading ? 'Processing…' : 'Checkout with eSewa'}
                                </button>

                                <button
                                    onClick={() => createOrderAndNavigate('khalti')}
                                    disabled={loading}
                                    className={`checkout-btn checkout-khalti`}
                                    style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
                                >
                                    {loading ? 'Processing…' : 'Checkout with Khalti'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </>
    );
};

export default CartPage;
