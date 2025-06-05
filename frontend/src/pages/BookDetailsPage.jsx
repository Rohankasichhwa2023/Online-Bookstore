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
    const [userRating, setUserRating] = useState(null);
    const [averageRating, setAverageRating] = useState(null);
    const [ratingCount, setRatingCount] = useState(0);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchBookDetails = async () => {
            try {
                // Include ?user_id=… so backend returns user_rating, average_rating, rating_count
                const res = await axios.get(
                    `http://localhost:8000/books/book-detail/${id}/?user_id=${user.id}`
                );
                setBook(res.data);
                setGenres(res.data.genres || []);
                setAverageRating(res.data.average_rating);
                setRatingCount(res.data.rating_count);
                setUserRating(res.data.user_rating);
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
                quantity: 1,
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
                book_id: id,
            });
            await updateFavorites();
            alert(res.data.message || 'Book favorited.');
        } catch (err) {
            console.error('Error adding to favorites:', err);
            alert('Could not add to favorites.');
        }
    };

    const handleRating = async (value) => {
        const user = JSON.parse(localStorage.getItem('user'));
        try {
            // 1) POST new rating to /books/rate/<book_id>/
            const response = await fetch(`http://localhost:8000/books/rate/${id}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: user.id,
                    rating: value,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // 2) Immediately update "Your Rating" UI
                setUserRating(value);

                // 3) Re‐fetch book‐detail so averageRating, ratingCount, and userRating stay in sync
                const res2 = await fetch(
                    `http://localhost:8000/books/book-detail/${id}/?user_id=${user.id}`
                );
                const updatedData = await res2.json();
                setAverageRating(updatedData.average_rating);
                setRatingCount(updatedData.rating_count);
                setUserRating(updatedData.user_rating);
            } else {
                alert(`Error: ${data.error || 'Unable to rate book.'}`);
            }
        } catch (error) {
            console.error('Error submitting rating:', error);
            alert('Error submitting rating.');
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

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
                        <h1>{book.title}</h1>
                        <p>
                            <strong>Author:</strong> {book.author}
                        </p>
                        <p>{book.description || 'No description available.'}</p>
                        <p>
                            <strong>Pages:</strong> {book.pages || '—'}
                        </p>
                        <p>
                            <strong>Language:</strong> {book.language}
                        </p>
                        <p>
                            <strong>Age Group:</strong> {book.age_group || '—'}
                        </p>
                        <p>
                            <strong>Price:</strong> Rs. {book.price}
                        </p>
                        <p>
                            <strong>Stock:</strong> {book.stock}
                        </p>
                        <p>
                            <strong>Genres:</strong> {genres.map((g) => g.name).join(', ') || '—'}
                        </p>
                        <p>
                            <strong>Uploaded At:</strong> {new Date(book.created_at).toLocaleDateString()}
                        </p>

                        <div style={{ marginTop: '10px' }}>
                            <strong>Average Rating:</strong>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <img
                                        key={i}
                                        src={
                                            i <= Math.round(averageRating || 0)
                                                ? '/icons/star.png'
                                                : '/icons/star-empty.png'
                                        }
                                        alt=""
                                        className="icon"
                                        style={{ height: '20px' }}
                                    />
                                ))}
                                <span>({ratingCount})</span>
                            </div>
                        </div>

                        <div style={{ marginTop: '10px' }}>
                            <strong>Your Rating:</strong>
                            <div style={{ display: 'flex', gap: '5px' }}>
                                {[1, 2, 3, 4, 5].map((value) => (
                                    <img
                                        key={value}
                                        src={
                                            value <= (userRating || 0) ? '/icons/star.png' : '/icons/star-empty.png'
                                        }
                                        alt=""
                                        className="icon"
                                        style={{ cursor: 'pointer', height: '20px' }}
                                        onClick={() => handleRating(value)}
                                    />
                                ))}
                            </div>
                        </div>

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
