import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SideNavbar from '../components/SideNavbar';
import TopNavbar from '../components/TopNavbar';
import "../css/ViewUsers.css";

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
        <>
            <SideNavbar/>
            <div className="dash-container" style={{marginBottom: "40px"}}>
                <TopNavbar title="View Book Ratings"/>
                {ratings.length === 0 ? (
                    <p>No ratings found.</p>
                ) : (
                    <table className="users-table">
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
        </>
    );
}
