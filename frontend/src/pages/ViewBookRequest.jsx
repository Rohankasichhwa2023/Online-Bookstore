import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import '../css/ViewBookRequest.css';

const STATUS_CATEGORIES = ['all', 'pending', 'in_progress', 'fulfilled'];
const STATUS_LABELS = {
    all: 'All',
    pending: 'Pending',
    in_progress: 'In Progress',
    fulfilled: 'Fulfilled',
};

export default function ViewBookRequest() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all');

    const admin = useMemo(
        () => JSON.parse(localStorage.getItem('adminUser') || 'null'),
        []
    );

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const response = await axios.get(
                    'http://localhost:8000/books/admin/book-requests/',
                    {
                        headers: { Authorization: `Bearer ${localStorage.getItem('access')}` },
                    }
                );
                setRequests(response.data);
            } catch (err) {
                setError('Failed to fetch book requests.');
            } finally {
                setLoading(false);
            }
        };
        fetchRequests();
    }, []);

    const handleStatusChange = async (id, newStatus) => {
        try {
            await axios.patch(
                `http://localhost:8000/books/admin/book-requests/${id}/status/`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${localStorage.getItem('access')}` } }
            );
            setRequests((prev) =>
                prev.map((req) =>
                    req.id === id ? { ...req, status: newStatus } : req
                )
            );
        } catch {
            alert('Failed to update status.');
        }
    };

    if (loading) return <p>Loading requests…</p>;
    if (error) return <p className="error">{error}</p>;

    const filtered =
        filter === 'all'
            ? requests
            : requests.filter((req) => req.status === filter);

    return (
        <div className="request-container">
            <h2>Book Requests</h2>
            <nav className="status-nav">
                {STATUS_CATEGORIES.map((cat) => (
                    <button
                        key={cat}
                        className={`nav-btn ${filter === cat ? 'active' : ''}`}
                        onClick={() => setFilter(cat)}
                    >
                        {STATUS_LABELS[cat]}
                    </button>
                ))}
            </nav>
            {filtered.length === 0 ? (
                <p>No book requests found.</p>
            ) : (
                <div className="request-list">
                    {filtered.map((req) => (
                        <div key={req.id} className="request-card">
                            <p>
                                <strong>User:</strong> {req.user.username} ({req.user.email})
                            </p>
                            <p><strong>Book:</strong> {req.book_name}</p>
                            {req.book_author && <p><strong>Author:</strong> {req.book_author}</p>}
                            {req.language && <p><strong>Language:</strong> {req.language}</p>}
                            <p>
                                <strong>Requested on:</strong>{' '}
                                {new Date(req.created_at).toLocaleString()}
                            </p>
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
                    ))}
                </div>
            )}
        </div>
    );
}