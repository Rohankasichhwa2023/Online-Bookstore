import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import '../css/AllBooks.css';

const AllBooks = ({ filter }) => {
    const navigate = useNavigate();
    const User = JSON.parse(localStorage.getItem('user'));
    const [books, setBooks] = useState([]);
    const { updateCart } = useCart();
    const { updateFavorites } = useFavorites();
    const [favoriteBookIds, setFavoriteBookIds] = useState([]);

    const [categories, setCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef();

    useEffect(() => {
        const handler = e => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

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
            setBooks(booksData);

            const allCats = new Set();
            booksData.forEach(b => {
                if (Array.isArray(b.genres)) {
                    b.genres.forEach(g => allCats.add(g.name));
                }
            });
            setCategories([...allCats]);

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

    const handleToggleFavorite = async (bookId) => {
        const isFav = favoriteBookIds.includes(bookId);

        // optimistic flip
        setFavoriteBookIds(prev =>
            isFav ? prev.filter(id => id !== bookId) : [...prev, bookId]
        );

        try {
            const res = await axios.post(
                'http://localhost:8000/books/toggle-favorite/',
                { user_id: User.id, book_id: bookId }
            );

            // update the navbar count
            await updateFavorites();
            alert(res.data.message);
        } catch (err) {
            console.error('Toggle favorite failed:', err);
            // rollback if needed
            setFavoriteBookIds(prev =>
                isFav ? [...prev, bookId] : prev.filter(id => id !== bookId)
            );
            alert('Could not update favorites.');
        }
    };


    const filteredBooks = books.filter(book => {
        const term = filter.trim().toLowerCase();
        // text match?
        const textMatch =
            !term ||
            book.title.toLowerCase().includes(term) ||
            book.author.toLowerCase().includes(term) ||
            book.language.toLowerCase().includes(term) ||
            (Array.isArray(book.genres) &&
                book.genres.some(g =>
                    g.name.toLowerCase().includes(term)
                )
            )

        // category match?
        const categoryMatch =
            selectedCategories.length === 0 ||
            (Array.isArray(book.genres) &&
                book.genres.some(g => selectedCategories.includes(g.name)));

        return textMatch && categoryMatch;
    });


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
            const favoriteIds = res.data.map(book => book.id);
            setFavoriteBookIds(favoriteIds);
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
        <>
            {/* Categories dropdown */}
            <div ref={dropdownRef} style={{ position: 'relative', marginBottom: '16px' }}>
                <button
                    onClick={() => setDropdownOpen(o => !o)}
                    style={{
                        padding: '8px 12px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        background: '#fff',
                        cursor: 'pointer'
                    }}
                >
                    {selectedCategories.length > 0
                        ? `Categories: ${selectedCategories.join(', ')}`
                        : 'Filter by Categories ▼'}
                </button>

                {dropdownOpen && (
                    <div
                        style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            zIndex: 10,
                            width: '250px',
                            maxHeight: '200px',
                            overflowY: 'auto',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            background: '#fff',
                            padding: '8px'
                        }}
                    >
                        {categories.map(cat => (
                            <label key={cat} style={{ display: 'block', marginBottom: '4px' }}>
                                <input
                                    type="checkbox"
                                    checked={selectedCategories.includes(cat)}
                                    onChange={() => {
                                        setSelectedCategories(prev =>
                                            prev.includes(cat)
                                                ? prev.filter(c => c !== cat)
                                                : [...prev, cat]
                                        );
                                    }}
                                />{' '}
                                {cat}
                            </label>
                        ))}
                    </div>
                )}
            </div>
            <div className="book-grid">
                {filteredBooks.map((book) => (
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
                                    onClick={e => { e.stopPropagation(); handleToggleFavorite(book.id); }}
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
                                    disabled={book.stock == 0}
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
                {filteredBooks.length === 0 && (
                    <p style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
                        No books match your search.
                    </p>
                )}
            </div>
        </>
    );
};

export default AllBooks;
