// src/pages/EditPersonalInfo.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function EditPersonalInfo() {
    // assume localStorage.user = { id, username, email, is_admin, ... }
    const stored = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = stored.id;

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        phone: ''
    });
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!userId) return;
        axios
            .get(`http://localhost:8000/users/usersInfoEdit/${userId}/`)
            .then(res => {
                setFormData({
                    username: res.data.username || '',
                    email: res.data.email || '',
                    phone: res.data.phone || ''
                });
            })
            .catch(() => setMessage('Failed to load your info.'));
    }, [userId]);

    const handleChange = e => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setMessage('');
        try {
            const res = await axios.put(`http://localhost:8000/users/usersInfoEdit/${userId}/`, formData);
            if (res.status === 200) {
                setMessage('Profile updated successfully.');
                // Sync localStorage
                localStorage.setItem('user', JSON.stringify({
                    ...stored,
                    username: res.data.username,
                    email: res.data.email,
                    phone: res.data.phone
                }));
            }
        } catch (err) {
            console.error(err);
            setMessage('Update failed. Check your inputs.');
        }
    };

    return (
        <div>
            <h2>Edit Personal Info</h2>
            {message && <p>{message}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Username</label><br />
                    <input
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Email</label><br />
                    <input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Phone (optional)</label><br />
                    <input
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                    />
                </div>
                <button type="submit">Update</button>
            </form>
        </div>
    );
}
