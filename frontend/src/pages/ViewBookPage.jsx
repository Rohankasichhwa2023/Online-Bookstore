import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ViewBookPage = () => {
    const [books, setBooks] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        try {
            const res = await axios.get('http://localhost:8000/books/all-books/');
            setBooks(res.data);
        } catch (error) {
            console.error('Error fetching books:', error);
        }
    };

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this book?");
        if (!confirmDelete) return;

        try {
            await axios.delete(`http://localhost:8000/books/delete-book/${id}/`);
            alert('Book deleted successfully.');
            setBooks(prev => prev.filter(book => book.id !== id));  // Update state
        } catch (error) {
            console.error('Error deleting book:', error);
            alert('Failed to delete book.');
        }
    };

    return (
        <>
            <button onClick={() => navigate('/admin-dashboard')}> Back to dashboard </button>
            <div>
                <h2>All Books</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                    {books.map(book => (
                        <div key={book.id} style={{ border: '1px solid #ccc', padding: '16px', width: '250px' }}>
                            {book.cover_image && (
                                <img
                                    src={book.cover_image}
                                    alt={book.title}
                                    style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                                />
                            )}
                            <h3><strong>Book id:</strong> {book.id}</h3>
                            <h3><strong>Title:</strong> {book.title}</h3>
                            <p><strong>Author:</strong> {book.author}</p>
                            <p><strong>Language:</strong> {book.language}</p>
                            <p><strong>Price:</strong> Rs. {book.price}</p>
                            <p><strong>Age Group:</strong> {book.age_group}</p>
                            <p><strong>Pages:</strong> {book.pages}</p>
                            <p><strong>Stock:</strong> {book.stock}</p>
                            <p><strong>Genres:</strong> {book.genres.map(genre => genre.name).join(', ')}</p>
                            <p><strong>Description:</strong> {book.description}</p>
                            <p><strong>Created At:</strong> {new Date(book.created_at).toLocaleDateString()}</p>
                            <p><strong>Updated At:</strong> {new Date(book.updated_at).toLocaleDateString()}</p>
                            <button onClick={() => handleDelete(book.id)} >Delete</button>
                            <button onClick={() => navigate(`/edit-book/${book.id}`)}> Edit Book </button>

                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default ViewBookPage;
