import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../css/ViewBookRequest.css';

function ViewBookRequest() {
    const [requests, setRequests] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const response = await axios.get("http://localhost:8000/books/admin/book-requests/", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('access')}`
                    }
                });
                setRequests(response.data);
            } catch (err) {
                setError("Failed to fetch book requests.");
            }
        };

        fetchRequests();
    }, []);

    const handleStatusChange = async (id, newStatus) => {
        try {
            await axios.patch(`http://localhost:8000/books/admin/book-requests/${id}/status/`, {
                status: newStatus
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('access')}`
                }
            });

            setRequests(prev => prev.map(req => req.id === id ? { ...req, status: newStatus } : req));
        } catch (err) {
            alert("Failed to update status.");
        }
    };

    return (
        <div className="request-container">
            <h2>Book Requests</h2>
            {error && <p className="error">{error}</p>}
            <div className="request-list">
                {requests.length === 0 ? (
                    <p>No book requests found.</p>
                ) : (
                    requests.map(req => (
                        <div key={req.id} className="request-card">
                            <p><strong>User:</strong> {req.user.username} ({req.user.email})</p>
                            <p><strong>Book:</strong> {req.book_name}</p>
                            {req.book_author && <p><strong>Author:</strong> {req.book_author}</p>}
                            {req.language && <p><strong>Language:</strong> {req.language}</p>}
                            <p><strong>Requested on:</strong> {new Date(req.created_at).toLocaleString()}</p>
                            <div className="status-control">
                                <label>Status:</label>
                                <select
                                    value={req.status}
                                    onChange={(e) => handleStatusChange(req.id, e.target.value)}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="fulfilled">Fulfilled</option>
                                </select>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default ViewBookRequest;
