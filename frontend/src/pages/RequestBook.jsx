// src/components/RequestBook.jsx
import React, { useState } from 'react';
import axios from 'axios';

export default function RequestBook() {
    const [user] = useState(() => JSON.parse(localStorage.getItem('user')));
    const [formData, setFormData] = useState({
        book_name: '',
        book_author: '',
        language: ''
    });
    const [message, setMessage] = useState('');

    const handleChange = e => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            const payload = {
                user: user.id,
                book_name: formData.book_name,
                book_author: formData.book_author,
                language: formData.language
            };
            const res = await axios.post('http://localhost:8000/books/request-book/', payload);
            if (res.status === 201) {
                setMessage('Request submitted successfully.');
                setFormData({ book_name: '', book_author: '', language: '' });
            }
        } catch (err) {
            console.error(err);
            setMessage('Submission failed. Please try again.');
        }
    };

    return (
        <div>
            <h2>Request a Book</h2>
            {message && <p>{message}</p>}
            <form onSubmit={handleSubmit}>
                <label>
                    Book Name
                    <input
                        name="book_name"
                        value={formData.book_name}
                        onChange={handleChange}
                        required
                    />
                </label>
                <label>
                    Author (optional)
                    <input
                        name="book_author"
                        value={formData.book_author}
                        onChange={handleChange}
                    />
                </label>
                <label>
                    Language (optional)
                    <input
                        name="language"
                        value={formData.language}
                        onChange={handleChange}
                    />
                </label>
                <button type="submit">Submit Request</button>
            </form>
        </div>
    );
}


