import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useFavorites } from '../context/FavoritesContext';
import { useCart } from '../context/CartContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../css/AllBooks.css';

const FavoritesPage = () => {
    const navigate = useNavigate();
    const [user] = useState(() => JSON.parse(localStorage.getItem('user')));
    const [favorites, setFavorites] = useState([]);
    const { updateFavorites } = useFavorites();
    const { updateCart } = useCart();

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchFavorites();
        updateFavorites();
        updateCart();
    }, [navigate, user, updateFavorites, updateCart]);

    const fetchFavorites = async () => {
        try {
            const res = await axios.get('http://localhost:8000/books/list-favorites/', {
                params: { user_id: user.id }
            });

            // Also fetch ratings for each favorite
            const favoritesWithRatings = await Promise.all(
                res.data.map(async (book) => {
                    try {
                        const ratingRes = await axios.get(`http://localhost:8000/books/rating/${book.id}/`);
                        return {
                            ...book,
                            average_rating: ratingRes.data.average_rating,
                            rating_count: ratingRes.data.rating_count,
                        };
                    } catch {
                        return {
                            ...book,
                            average_rating: 0,
                            rating_count: 0,
                        };
                    }
                })
            );

            setFavorites(favoritesWithRatings);
        } catch (err) {
            console.error('Error fetching favorites:', err);
        }
    };

    const handleRemoveFavorite = async (bookId) => {
        try {
            const res = await axios.post('http://localhost:8000/books/remove-favorite/', {
                user_id: user.id,
                book_id: bookId
            });
            alert(res.data.message || 'Removed from favorites.');
            fetchFavorites();
            await updateFavorites();
        } catch (err) {
            console.error('Error removing favorite:', err);
            alert('Could not remove favorite.');
        }
    };

    const handleAddToCart = async (bookId) => {
        try {
            await axios.post('http://localhost:8000/carts/add-to-cart/', {
                user_id: user.id,
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

    if (!user) return null;

    function truncateTitle(title) {
        if (title.length > 28) {
            return title.slice(0, 28) + '...';
        }
        return title;
    }

    return (
        <>
            <Navbar/>
            <div className="favorite-container">                
                {favorites.length === 0 ? (
                    <div className="empty-cart">
                        <p>You have not favorited any books yet.</p>
                        <button className="explore-books-btn" onClick={() => navigate('/shop')}><div>Explore books</div><div><img src="/icons/explore-white.png" className="icon-explore" /></div></button>                    
                    </div> 
                ) : (   
                    <div>           
                        <h1 style={{textAlign: "center"}}>Your Favorites</h1>      
                        <div className="book-grid">                            
                            {favorites.map((book) => (
                                <div className="book-card" key={book.id} onClick={() => navigate(`/book/${book.id}`)}>

                                    <div>
                                        {book.cover_image && (
                                            <img
                                                src={book.cover_image}
                                                alt={book.title}
                                                className="book-cover"
                                            />
                                        )}
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                            {renderStars(book.average_rating || 0)}
                                        </div>
                                        <span style={{ fontSize: '14px', color: '#6d6d6d' }}>
                                            ({book.rating_count || 0})
                                        </span>
                                    </div>

                                    <div className="book-details2">
                                        <p className="book-title2">{truncateTitle(book.title)}</p>
                                        <p className="book-author2">{book.author}</p>
                                        <p className="book-price2">Rs {book.price}</p>
                                    </div>

                                    <div className="book-footer">
                                        <div>
                                            <button
                                                className="btn-favorite"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRemoveFavorite(book.id);
                                                }}
                                            >
                                                <img
                                                    src="/icons/add-to-fav-filled.png"
                                                    className="icon"
                                                    alt="Remove"
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
                                                disabled={book.stock === 0}
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
                    </div>
                )}
            </div>
            <Footer/>
        </>
    );
};

export default FavoritesPage;
