// src/pages/ChangePassword.jsx

import React, { useState } from 'react';
import axios from 'axios';

export default function ChangePassword() {
    const stored = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = stored.id;

    const [formData, setFormData] = useState({
        current_password: '',
        new_password: ''
    });
    const [message, setMessage] = useState('');

    const handleChange = e => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setMessage('');
        try {
            const res = await axios.post(
                `http://localhost:8000/users/change-password/${userId}/`,
                formData
            );
            if (res.status === 200) {
                setMessage(res.data.message);
                setFormData({ current_password: '', new_password: '' });
            }
        } catch (err) {
            const errMsg =
                err.response?.data?.error || 'Password change failed.';
            setMessage(errMsg);
        }
    };

    return (
        <div>
            <h2>Change Password</h2>
            {message && <p>{message}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Current Password</label><br />
                    <input
                        name="current_password"
                        type="password"
                        value={formData.current_password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>New Password</label><br />
                    <input
                        name="new_password"
                        type="password"
                        value={formData.new_password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit">Update Password</button>
            </form>
        </div>
    );
}
