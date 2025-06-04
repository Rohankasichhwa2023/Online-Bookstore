// src/pages/HomePage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import '../css/HomePage.css';

const HomePage = () => {
    const navigate = useNavigate();
    const User = JSON.parse(localStorage.getItem('user'));
    const [books, setBooks] = useState([]);
    const { updateCart } = useCart();
    const { updateFavorites } = useFavorites();

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user'));
        if (!userData) {
            navigate('/login');
            return;
        }
        fetchBooks();

        // Immediately re‐fetch global counts for this user
        updateCart();
        updateFavorites();
    }, [navigate, updateCart, updateFavorites]);

    const fetchBooks = async () => {
        try {
            const res = await axios.get('http://localhost:8000/books/all-books/');
            setBooks(res.data);
        } catch (err) {
            console.error('Error fetching books:', err);
        }
    };

    const handleAddToCart = async (bookId) => {
        try {
            await axios.post('http://localhost:8000/carts/add-to-cart/', {
                user_id: User.id,
                book_id: bookId,
                quantity: 1
            });
            await updateCart(); // refresh count immediately
            alert('Book added to cart.');
        } catch (err) {
            console.error('Could not add to cart:', err);
            alert('Could not add to cart.');
        }
    };

    const handleAddToFavorite = async (bookId) => {
        try {
            const res = await axios.post('http://localhost:8000/books/add-favorite/', {
                user_id: User.id,
                book_id: bookId
            });
            await updateFavorites(); // refresh favorite count immediately
            alert(res.data.message || 'Book favorited.');
        } catch (err) {
            console.error('Error adding to favorites:', err);
            if (err.response && err.response.data) {
                const detail = err.response.data.error || JSON.stringify(err.response.data);
                alert(`Could not add to favorites: ${detail}`);
            } else {
                alert('Could not add to favorites.');
            }
        }
    };

    if (!User) return null;

    return (
        <>
            <Navbar />
            <div className="homepage-container">
                <div className="frame1" style={{ backgroundImage: "url('/bg-image/1.png')" }}>
                    <div className="frame1-content">
                        <div>
                            <h1>What books are you looking for?</h1>
                            <p>Not sure what to read next? Explore books from our shop.</p>
                        </div>
                        <div>
                            <button className="explore-books-btn" onClick={() => navigate('/shop')}><img src="/icons/explore.png" className="icon" /> Explore books</button>
                        </div>
                    </div>
                </div>

                <div className="frame2">
                    <div className="frame2-image" style={{ backgroundImage: "url('/bg-image/2.png')" }}>
                        <h1>Our Story</h1>
                    </div>
                    <div className="frame2-text">
                        <p>Best Reads began with a simple idea to make books more accessible to everyone, everywhere. What started as a small physical bookstore grew into a vision to connect readers with the stories they love through a seamless online experience. We believe books have the power to entertain, educate, and inspire. From thrilling fiction and insightful self-help to manga, history, and beyond, our collection is curated to meet the diverse interests of readers aged 13 to 35 and beyond. At Best Reads, we’re not just selling books we’re building a space where people can discover, connect, and grow through reading.</p>
                    </div>
                </div>

                <div className="frame3">
                    <div className="frame3-text">
                        <p>Our goal is to become a trusted and loved online bookstore that offers a wide range of books at fair prices while making reading more convenient and enjoyable for everyone. <strong>Happy Reading!!</strong></p>
                    </div>

                    <div className="frame3-image" style={{ backgroundImage: "url('/bg-image/3.png')" }}>
                        <h1>Our Goal</h1>
                    </div>
                </div>

                <div className="frame4">
                    <div className="contact-info">
                        <h2>Get in touch</h2>

                        <div className="contact-item">
                            <div style={{ display: "flex", gap: "12px" }}>
                                <img src="/icons/location.png" className="icon" />
                                <h3>Location</h3>
                            </div>
                            <p>Kathmandu, Nepal</p>
                        </div>

                        <div className="contact-item">
                            <div style={{ display: "flex", gap: "12px" }}>
                                <img src="/icons/email.png" className="icon" />
                                <h3>Email</h3>
                            </div>
                            <p>bestreads@gmail.com</p>
                        </div>

                        <div className="contact-item">
                            <div style={{ display: "flex", gap: "12px" }}>
                                <img src="/icons/phone.png" className="icon" />
                                <h3>Phone</h3>
                            </div>
                            <p>01-44112233</p>
                        </div>

                        <div className="contact-item">
                            <div style={{ display: "flex", gap: "12px" }}>
                                <img src="/icons/policy.png" className="icon" />
                                <h3>Return Policy</h3>
                            </div>
                            <p>Return accepted within 7 days.</p>
                        </div>

                        <button className="contact-btn" onClick={() => navigate('/contact')}>Contact us</button>
                    </div>

                    <div>
                        <div>

                            <iframe
                                title="Best Reads Location"
                                src="https://www.google.com/maps?q=27.710326,85.324520(Best%20Reads)&z=15&output=embed"
                                width="500"
                                height="420"
                                style={{ border: "0", borderRadius: "12px" }}
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                            <p style={{ textAlign: "center", marginTop: "10px" }}>
                                <strong>Best Reads</strong><br />
                                Kathmandu, Nepal
                            </p>

                        </div>

                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default HomePage;
