import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../css/ViewRatings.css';

export default function ViewRatings() {
    const [ratings, setRatings] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        axios.get('http://localhost:8000/admin_logs/ratings-summary/', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('access')}`
            }
        })
            .then(response => setRatings(response.data))
            .catch(() => setError("Failed to fetch average ratings."));
    }, []);

    return (
        <div className="ratings-summary-container">
            <h2>Book Average Ratings</h2>
            {error && <p className="error">{error}</p>}
            {ratings.length === 0 ? (
                <p>No ratings found.</p>
            ) : (
                <table className="ratings-summary-table">
                    <thead>
                        <tr>
                            <th>Book Title</th>
                            <th>Average Rating</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ratings.map((book) => (
                            <tr key={book.id}>
                                <td>{book.title}</td>
                                <td>{book.avg_rating ? book.avg_rating.toFixed(2) : 'N/A'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
