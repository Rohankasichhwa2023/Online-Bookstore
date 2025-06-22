import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SideNavbar from '../components/SideNavbar';
import TopNavbar from '../components/TopNavbar';
import "../css/ViewUsers.css";

const ViewUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await axios.get('http://localhost:8000/users/non-admins/');
                setUsers(res.data);
            } catch (err) {
                console.error('Error fetching users:', err);
                setError('Failed to load users.');
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    if (loading) return <div className="status-msg">Loading users…</div>;
    if (error) return <div className="status-msg error">{error}</div>;

    return (
        <>
            <SideNavbar/>
            <div className="dash-container" style={{marginBottom: "40px"}}>
                <TopNavbar title="View Users"/>
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Joined</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td>{user.username}</td>
                                <td>{user.email}</td>
                                <td>{user.phone || '—'}</td>
                                <td>{new Date(user.created_at).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </>
    );
};

export default ViewUsers;
