import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function LoginPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [message, setMessage] = useState('');

    const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:8000/users/login/', formData);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            navigate("/home")
        } catch (err) {
            setMessage(err.response.data.error || 'Login failed');
        }
    };

    return (
        <div>
            <h2>Login</h2>
            {message && <p>{message}</p>}
            <form onSubmit={handleSubmit}>
                <input name="username" onChange={handleChange} placeholder="Username" required />
                <input name="password" type="password" onChange={handleChange} placeholder="Password" required />
                <button type="submit">Login</button>
            </form>
        </div>
    );
}
