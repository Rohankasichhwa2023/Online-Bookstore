// src/pages/HomePage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import UserLogoutButton from '../components/UserLogoutButton';
import CartButton from '../components/CartButton';
import FavoriteButton from '../components/Favorite';
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
                <h2>Welcome, {User.username}!</h2>
                <UserLogoutButton />
                <CartButton />
                <FavoriteButton />

                <h3>All Books</h3>
                <div className="book-grid">
                    {books.map((book) => (
                        <div className="book-card" key={book.id}>
                            {book.cover_image && (
                                <img
                                    src={book.cover_image}
                                    alt={book.title}
                                    className="book-cover"
                                />
                            )}
                            <h4>{book.title}</h4>
                            <p>
                                <strong>Author:</strong> {book.author}
                            </p>
                            <p>
                                <strong>Price:</strong> Rs. {book.price}
                            </p>
                            <div className="button-group">
                                <button
                                    onClick={() => handleAddToCart(book.id)}
                                    className="btn primary-btn"
                                >
                                    Add to Cart
                                </button>
                                <button
                                    onClick={() => handleAddToFavorite(book.id)}
                                    className="btn secondary-btn"
                                >
                                    Favorite
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default HomePage;
