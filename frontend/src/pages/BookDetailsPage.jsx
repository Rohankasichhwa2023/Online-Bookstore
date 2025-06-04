// src/pages/BookDetailsPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import Navbar from '../components/Navbar';
import UserLogoutButton from '../components/UserLogoutButton';
import CartButton from '../components/CartButton';
import FavoriteButton from '../components/Favorite';


const BookDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const { updateCart } = useCart();
    const { updateFavorites } = useFavorites();

    const [book, setBook] = useState({});
    const [genres, setGenres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));

        if (!user) {
            navigate('/login');
            return;
        }

        const fetchBookDetails = async () => {
            try {
                const res = await axios.get(`http://localhost:8000/books/book-detail/${id}/`);
                setBook(res.data);
                setGenres(res.data.genres || []);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching book details:', err);
                setError('Could not load book details.');
                setLoading(false);
            }
        };

        fetchBookDetails();
        updateCart();
        updateFavorites();
    }, [id, navigate, updateCart, updateFavorites]);

    const handleAddToCart = async () => {
        const user = JSON.parse(localStorage.getItem('user'));
        try {
            await axios.post('http://localhost:8000/carts/add-to-cart/', {
                user_id: user.id,
                book_id: id,
                quantity: 1
            });
            await updateCart();
            alert('Book added to cart.');
        } catch (err) {
            console.error('Could not add to cart:', err);
            alert('Could not add to cart.');
        }
    };

    const handleAddToFavorite = async () => {
        const user = JSON.parse(localStorage.getItem('user'));
        try {
            const res = await axios.post('http://localhost:8000/books/add-favorite/', {
                user_id: user.id,
                book_id: id
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

    if (loading) {
        return <div className="book-details-loading">Loading...</div>;
    }
    if (error) {
        return <div className="book-details-error">{error}</div>;
    }
    if (!book) {
        return <div className="book-details-empty">Book not found.</div>;
    }

    return (
        <>
            <Navbar />
            <div className="BookDetails-container">
                <UserLogoutButton />
                <CartButton />
                <FavoriteButton />

                <div className="BookDetails-content">
                    <div className="BookDetails-image">
                        {book.cover_image ? (
                            <img src={book.cover_image} alt={book.title} />
                        ) : (
                            <div className="no-cover">No Cover Image</div>
                        )}
                    </div>
                    <div className="BookDetails-info">
                        <h1 className="BookDetails-title">{book.title}</h1>
                        <p className="BookDetails-author">
                            <strong>Author:</strong> {book.author}
                        </p>
                        <p className="BookDetails-description">
                            {book.description || 'No description available.'}
                        </p>
                        <p className="BookDetails-field">
                            <strong>Pages:</strong> {book.pages || '—'}
                        </p>
                        <p className="BookDetails-field">
                            <strong>Language:</strong> {book.language}
                        </p>
                        <p className="BookDetails-field">
                            <strong>Age Group:</strong> {book.age_group || '—'}
                        </p>
                        <p className="BookDetails-field">
                            <strong>Price:</strong> Rs. {book.price}
                        </p>
                        <p className="BookDetails-field">
                            <strong>Stock:</strong> {book.stock}
                        </p>
                        <div className="BookDetails-genres">
                            <strong>Genres:</strong>{' '}
                            {genres.length > 0 ? genres.map(g => g.name).join(', ') : '—'}
                        </div>
                        <p className="BookDetails-dates">
                            <strong>Uploaded At:</strong>{' '}
                            {new Date(book.created_at).toLocaleDateString()}
                        </p>


                        <div className="BookDetails-buttons">
                            <button className="btn primary-btn" onClick={handleAddToCart}>
                                Add to Cart
                            </button>
                            <button className="btn secondary-btn" onClick={handleAddToFavorite}>
                                Favorite
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default BookDetailsPage;
