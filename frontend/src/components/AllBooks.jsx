import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import '../css/AllBooks.css';

const AllBooks = () => {
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
                quantity: 1,
            });
            await updateCart();
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
                book_id: bookId,
            });
            await updateFavorites();
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
        <div className="book-grid">
            {books.map((book) => (
                <div className="book-card" key={book.id} onClick={() => navigate(`/book/${book.id}`)}>
                        {/* Book Cover Image */}
                        <div>
                            {book.cover_image && (
                                <img
                                    src={book.cover_image}
                                    alt={book.title}
                                    className="book-cover"
                                />
                            )}
                        </div>

                        {/* Book Rating */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>                                    
                            <div style={{ display: "flex", gap: "4px" }}>
                                {Array.from({ length: 5 }, (_, i) => (
                                <img key={i} src="/icons/star.png" className="icon" />
                                ))}
                            </div>
                            <span style={{ fontSize: "14px", color: "#6d6d6d" }}>(26)</span>                                        
                        </div>

                        {/* Book Details */}
                        <div className="book-details">
                            <p className="book-title">{book.title}</p>
                            <p className="book-author">{book.author}</p>
                            <p className="book-price">Rs {book.price}</p>
                        </div>

                        <div className="book-footer">
                            <div>
                                <button
                                    className="btn-favorite"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleAddToFavorite(book.id);
                                    }}
                                >
                                    <img src="/icons/add-to-fav.png" className="icon"/>
                                </button>
                            </div>

                            <div>
                                <button
                                    className="btn-add-cart"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleAddToCart(book.id);
                                    }}
                                >
                                    Add to Cart <div><img src="/icons/add-to-cart-white.png" className="icon"/></div>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
        </div>
    );
};

export default AllBooks;