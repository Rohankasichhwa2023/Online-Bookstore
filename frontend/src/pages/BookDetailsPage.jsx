import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import "../css/BookDetailPage.css"

const BookDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { updateCart } = useCart();
    const { updateFavorites } = useFavorites();

    const [book, setBook] = useState({});
    const [genres, setGenres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [tempRating, setTempRating] = useState(0);
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

    const handleRating = (value) => {
        setTempRating(value);
    };

    const handlePost = async (tempRating) => {
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
                    rating: tempRating,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // 2) Immediately update UI
                setUserRating(tempRating);

                // 3) Re‐fetch book‐detail so averageRating, ratingCount, and userRating stay in sync
                const res2 = await fetch(
                    `http://localhost:8000/books/book-detail/${id}/?user_id=${user.id}`
                );
                const updatedData = await res2.json();
                setAverageRating(updatedData.average_rating);
                setRatingCount(updatedData.rating_count);
                setUserRating(updatedData.user_rating);
                alert('Rating posted successfully!');
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
            <div className="book-detail">
                <div>
                    <button className="back-btn" onClick={() => navigate(-1)}><img src="/icons/left.png" alt="Back" /></button>
                </div>
                <div className="book-detail-left">
                    <img src={book.cover_image} alt={book.title} className="book-image"/>
                    
                    <div style={{border: "1px solid #dee2e6", borderRadius: "8px"}}>
                        <div className="user-rate">
                            
                            <div style={{textAlign: "center"}}>
                                <h6 style={{color: "#052c65"}}>Rate this book</h6>
                            </div>
                            
                            <div style={{display: "flex", justifyContent: "center"}}>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                    {[1, 2, 3, 4, 5].map((value) => (
                                        <img
                                            key={value}
                                            src={
                                                value <= (tempRating || userRating || 0) ? '/icons/star.png' : '/icons/star-empty.png'
                                            }
                                            alt=""
                                            className="icon"
                                            style={{ cursor: 'pointer', height: '20px' }}
                                            onClick={() => handleRating(value)}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div style={{textAlign: "right"}}>
                                <button class="post-btn" onClick={() => handlePost(tempRating)}>Post</button>
                            </div>

                        </div>
                    </div>
                </div>
                
                <div className="book-detail-right">

                    <div>
                        <h1 className="book-title">{book.title}</h1>
                        <p className="author-name">{book.author}</p>
                    </div>

                    <div className="rate-fav-bar">                     
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
                            <span style={{color: "#6d6d6d"}}>({ratingCount})</span>
                        </div>
                        <div>
                            <button className="btn-favorite" onClick={handleAddToFavorite}><img className="icon" src="/icons/add-to-fav.png" /></button>
                        </div>
                    </div>

                    <div>
                        <div className="accordion" id="accordionExample">
                            <div className="accordion-item">
                                <h2 className="accordion-header" id="headingOne">
                                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="false" aria-controls="collapseOne">
                                    <strong>Details</strong>
                                </button>
                                </h2>
                                <div id="collapseOne" className="accordion-collapse collapse" aria-labelledby="headingOne" data-bs-parent="#accordionExample">
                                    <div className="accordion-body1">
                                        <p style={{textAlign: "left", lineHeight: "1.5", margin: "0px 0px 12px 0px", fontSize: "16px"}}>{book.description}</p>
                                        <div className="book-info">
                                            <h3>Genre</h3>
                                            <p>{genres.map((g) => g.name).join(', ')}</p>
                                        </div>
                                        <div className="book-info">
                                            <h3>Language</h3>
                                            <p>{book.language}</p>
                                        </div>
                                        <div className="book-info">
                                            <h3>Pages</h3>
                                            <p>{book.pages} pages</p>
                                        </div>
                                        <div className="book-info">
                                            <h3>Age group</h3>
                                            <p>{book.age_group} years old</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="accordion-item">
                                <h2 className="accordion-header" id="headingTwo">
                                <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="true" aria-controls="collapseTwo">
                                    <strong>Purchase</strong>
                                </button>
                                </h2>
                                <div id="collapseTwo" className="accordion-collapse collapse show" aria-labelledby="headingTwo" data-bs-parent="#accordionExample">
                                    <div className="accordion-body2">
                                    
                                        <div className="up-one">
                                            <p style={{padding: "0px", margin: "0px 0px 8px 0px", fontSize: "20px"}}><strong>Rs {book.price}</strong></p>
                                        </div>

                                        <div className="down-one">
                                            <p className="stock" style={{ color: book.stock > 0 ? "#4CAF50" : "#E74242" }}>{book.stock>0?"in stock":"out of stock"}</p>
                                            <button onClick={handleAddToCart} disabled={book.stock==0}><div>Add to cart</div><div><img src="/icons/add-to-cart-white.png" className="icon"/></div></button>
                                        </div>
                                        
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer/>
        </>
    );
};

export default BookDetailsPage;
