import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function RegisterPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: '', email: '', password: '', phone: '' });
    const [message, setMessage] = useState('');

    const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:8000/users/register/', formData);
            navigate("/login")
        } catch (err) {
            setMessage(err.response.data.error || 'Registration failed');
        }
    };

    return (
        <div>
            <h2>Register</h2>
            {message && <p>{message}</p>}
            <form onSubmit={handleSubmit}>
                <input name="username" onChange={handleChange} placeholder="Username" required />
                <input name="email" type="email" onChange={handleChange} placeholder="Email" required />
                <input name="phone" onChange={handleChange} placeholder="Phone" />
                <input name="password" type="password" onChange={handleChange} placeholder="Password" required />
                <button type="submit">Register</button>
            </form>
        </div>
    );
}
