import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import SideNavbar from '../components/SideNavbar';
import TopNavbar from '../components/TopNavbar';
import '../css/ViewUsers.css';

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

    if (loading) return <p className="status-msg">Loading requests…</p>;
    if (error) return <p className="status-msg error">{error}</p>;

    const filtered =
        filter === 'all'
            ? requests
            : requests.filter((req) => req.status === filter);

    return (
        <>
            <SideNavbar />
            <div className="dash-container">
                <TopNavbar title="Manage Book Requests" />
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
                    <div className="table-container">
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Email</th>
                                    <th>Book</th>
                                    <th>Author</th>
                                    <th>Language</th>
                                    <th>Requested On</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((req) => (
                                    <tr key={req.id}>
                                        <td>{req.user.username}</td>
                                        <td>{req.user.email}</td>
                                        <td>{req.book_name}</td>
                                        <td>{req.book_author || '—'}</td>
                                        <td>{req.language || '—'}</td>
                                        <td>{new Date(req.created_at).toLocaleString()}</td>
                                        <td>
                                            <select
                                                className="status-select"
                                                value={req.status}
                                                onChange={(e) =>
                                                    handleStatusChange(req.id, e.target.value)
                                                }
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="in_progress">In Progress</option>
                                                <option value="fulfilled">Fulfilled</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
}
