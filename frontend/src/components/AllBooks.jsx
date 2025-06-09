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
    const [favoriteBookIds, setFavoriteBookIds] = useState([]);

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user'));
        if (!userData) {
            navigate('/login');
            return;
        }
        fetchBooks();
        fetchFavorites();
        updateCart();
        updateFavorites();
    }, [navigate, updateCart, updateFavorites]);

    const fetchBooks = async () => {
        try {
            // 1) Fetch all books
            const res = await axios.get('http://localhost:8000/books/all-books/');
            const booksData = res.data;

            // 2) For each book, fetch its rating info
            const booksWithRatings = await Promise.all(
                booksData.map(async (book) => {
                    try {
                        const ratingRes = await axios.get(
                            `http://localhost:8000/books/rating/${book.id}/`
                        );
                        return {
                            ...book,
                            average_rating: ratingRes.data.average_rating,
                            rating_count: ratingRes.data.rating_count,
                        };
                    } catch (ratingErr) {
                        console.error(
                            `Error fetching rating for book ${book.id}:`,
                            ratingErr
                        );
                        // If rating fetch fails, default to 0/0
                        return {
                            ...book,
                            average_rating: 0,
                            rating_count: 0,
                        };
                    }
                })
            );

            setBooks(booksWithRatings);
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
            // Optimistically update UI
            setFavoriteBookIds((prev) =>
                prev.includes(bookId)
                    ? prev.filter((id) => id !== bookId)
                    : [...prev, bookId]
            );

            // Send request to backend
            const res = await axios.post('http://localhost:8000/books/add-favorite/', {
                user_id: User.id,
                book_id: bookId,
            });

            // Optional: delay to allow backend to finish processing before refetching
            setTimeout(() => {
                fetchFavorites(); // sync actual state after backend updates
            }, 300); // 300ms delay

            await updateFavorites();
            alert(res.data.message || 'Book favorited.');
        } catch (err) {
            console.error('Error adding to favorites:', err);
            alert('Could not add to favorites.');
        }
    };


    const renderStars = (averageRating) => {
        const fullStars = Math.floor(averageRating);
        const halfStar = averageRating - fullStars >= 0.5;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

        return (
            <>
                {Array.from({ length: fullStars }, (_, i) => (
                    <img key={`full-${i}`} src="/icons/star.png" className="icon" alt="★" />
                ))}
                {halfStar && <img src="/icons/star-half.png" className="icon" alt="☆" />}
                {Array.from({ length: emptyStars }, (_, i) => (
                    <img key={`empty-${i}`} src="/icons/star-empty.png" className="icon" alt="☆" />
                ))}
            </>
        );
    };

    const fetchFavorites = async () => {
        try {
            const res = await axios.get('http://localhost:8000/books/list-favorites/', {
                params: { user_id: User.id }
            });
            const favoriteIds = res.data.map(fav => fav.book_id);
            setFavoriteBookIds(favoriteIds);  // THIS must reflect accurate state
        } catch (err) {
            console.error('Error fetching favorites:', err);
        }
    };


    if (!User) return null;

    function truncateTitle(title) {
        if (title.length > 33) {
            return title.slice(0, 33) + '...';
        }
        return title;
    }

    return (
        <div className="book-grid">
            {books.map((book) => (
                <div
                    className="book-card"
                    key={book.id}
                    onClick={() => navigate(`/book/${book.id}`)}
                >
                    {/* Book Cover */}
                    <div>
                        {book.cover_image && (
                            <img
                                src={book.cover_image}
                                alt={book.title}
                                className="book-cover"
                            />
                        )}
                    </div>

                    {/* Rating Section */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                        }}
                    >
                        <div style={{ display: 'flex', gap: '4px' }}>
                            {renderStars(book.average_rating || 0)}
                        </div>
                        <span style={{ fontSize: '14px', color: '#6d6d6d' }}>
                            ({book.rating_count || 0})
                        </span>
                    </div>

                    {/* Book Details */}
                    <div className="book-details2">
                        <p className="book-title2">{truncateTitle(book.title)}</p>
                        <p className="book-author2">{book.author}</p>
                        <p className="book-price2">Rs {book.price}</p>
                    </div>

                    {/* Buttons */}
                    <div className="book-footer">
                        <div>
                            <button
                                className="btn-favorite"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddToFavorite(book.id);
                                }}
                            >
                                <img
                                    src={
                                        favoriteBookIds.includes(book.id)
                                            ? '/icons/add-to-fav-filled.png'
                                            : '/icons/add-to-fav.png'
                                    }
                                    className="icon"
                                    alt="♡"
                                />
                            </button>

                        </div>
                        <div>
                            <button
                                className="btn-add-cart"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddToCart(book.id);
                                }}
                                disabled={book.stock==0}
                            >
                                Add to Cart
                                <div>
                                    <img
                                        src="/icons/add-to-cart-white.png"
                                        className="icon"
                                        alt="＋"
                                    />
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AllBooks;
