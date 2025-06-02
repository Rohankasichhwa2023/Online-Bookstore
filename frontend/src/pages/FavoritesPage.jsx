// src/pages/FavoritesPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import UserLogoutButton from '../components/UserLogoutButton';
import CartButton from '../components/CartButton';
import 'E:/bookstore/Online-Bookstore/frontend/src/css/FavoritesPage.css';

const FavoritesPage = () => {
    const navigate = useNavigate();
    const User = JSON.parse(localStorage.getItem('user'));
    const [favorites, setFavorites] = useState([]);

    useEffect(() => {
        if (!User) {
            navigate('/login');
            return;
        }
        fetchFavorites();
    }, [User, navigate]);

    const fetchFavorites = async () => {
        try {
            const res = await axios.get(
                'http://localhost:8000/books/list-favorites/',
                {
                    params: { user_id: User.id },
                }
            );
            setFavorites(res.data);
        } catch (err) {
            console.error('Error fetching favorites:', err);
        }
    };

    const handleRemoveFavorite = async (bookId) => {
        try {
            const res = await axios.post(
                'http://localhost:8000/books/remove-favorite/',
                {
                    user_id: User.id,
                    book_id: bookId,
                }
            );
            // Show server’s message, then refresh list:
            alert(res.data.message || 'Removed from favorites.');
            fetchFavorites();
        } catch (err) {
            console.error('Error removing favorite:', err);
            if (err.response && err.response.data) {
                const detail = err.response.data.error || JSON.stringify(err.response.data);
                alert(`Could not remove favorite: ${detail}`);
            } else {
                alert('Could not remove favorite.');
            }
        }
    };

    if (!User) return null;

    return (
        <div className="favorites-container">
            <h2>{User.username}’s Favorites</h2>
            <UserLogoutButton />
            <CartButton />

            {favorites.length === 0 ? (
                <p>You have not favorited any books yet.</p>
            ) : (
                <div className="favorites-grid">
                    {favorites.map((book) => (
                        <div className="favorite-card" key={book.id}>
                            {book.cover_image && (
                                <img
                                    src={book.cover_image}
                                    alt={book.title}
                                    className="favorite-cover"
                                />
                            )}
                            <h4>{book.title}</h4>
                            <p><strong>Author:</strong> {book.author}</p>
                            <p><strong>Price:</strong> Rs. {book.price}</p>
                            <button
                                onClick={() => handleRemoveFavorite(book.id)}
                                className="btn remove-btn"
                            >
                                Remove from Favorites
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FavoritesPage;
