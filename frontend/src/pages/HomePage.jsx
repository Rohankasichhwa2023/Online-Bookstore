import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserLogoutButton from '../components/UserLogoutButton';
import axios from 'axios';

const Home = () => {
    const navigate = useNavigate();
    const User = JSON.parse(localStorage.getItem('user'));
    const [books, setBooks] = useState([]);

    useEffect(() => {
        if (!User) {
            navigate('/login');
        } else {
            fetchBooks();
        }
    }, [User]);

    const fetchBooks = async () => {
        try {
            const res = await axios.get('http://localhost:8000/books/all-books/');
            setBooks(res.data);
        } catch (err) {
            console.error('Failed to fetch books', err);
        }
    };

    if (!User) {
        return null;
    }

    return (
        <div>
            <h2>Welcome, {User.username}!</h2>
            <UserLogoutButton />
            <br />
            <h3>All Books</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {books.map(book => (
                    <div key={book.id} style={{
                        border: '1px solid #ccc',
                        borderRadius: '8px',
                        padding: '16px',
                        margin: '10px',
                        width: '250px'
                    }}>
                        {book.cover_image && (
                            <img
                                src={book.cover_image}
                                alt={book.title}
                                style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                            />
                        )}
                        <h4>{book.title}</h4>
                        <p><strong>Author:</strong> {book.author}</p>
                        <p><strong>Price:</strong> ${book.price}</p>
                        <p><strong>Description:</strong> {book.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Home;
