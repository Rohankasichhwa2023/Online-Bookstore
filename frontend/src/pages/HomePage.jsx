// src/pages/HomePage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserLogoutButton from '../components/UserLogoutButton';
import axios from 'axios';
import CartButton from '../components/CartButton';

const Home = () => {
    const navigate = useNavigate();
    const User = JSON.parse(localStorage.getItem('user'));
    const [books, setBooks] = useState([]);

    useEffect(() => {
        if (!User) return navigate('/login');
        fetchBooks();
    }, [User, navigate]);

    const fetchBooks = async () => {
        const res = await axios.get('http://localhost:8000/books/all-books/');
        setBooks(res.data);
    };

    const handleAddToCart = async (bookId) => {
        try {
            await axios.post('http://localhost:8000/carts/add-to-cart/', {
                user_id: User.id,
                book_id: bookId,
                quantity: 1,
            });
            alert('Book added to cart.');
        } catch (err) {
            console.error(err);
            alert('Could not add to cart.');
        }
    };



    if (!User) return null;

    return (
        <div>
            <h2>Welcome, {User.username}!</h2>
            <UserLogoutButton />
            <CartButton />
            <h3>All Books</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                {books.map(book => (
                    <div key={book.id} style={{
                        border: '1px solid #ccc', borderRadius: '8px',
                        padding: '16px', width: '250px'
                    }}>
                        {book.cover_image && (
                            <img src={book.cover_image} alt={book.title}
                                style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                        )}
                        <h4>{book.title}</h4>
                        <p><strong>Author:</strong> {book.author}</p>
                        <p><strong>Price:</strong> Rs. {book.price}</p>
                        <button
                            onClick={() => handleAddToCart(book.id)}
                            style={{ marginTop: '10px' }}
                        >
                            Add to Cart
                        </button>

                    </div>
                ))}
            </div>
        </div>
    );
};

export default Home;
