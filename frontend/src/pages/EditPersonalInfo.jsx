import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../css/LoginPage.css';

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
        <>
            <Navbar/>
            <div style={{paddingTop: "140px", paddingBottom: "90px", display: "flex", justifyContent: "center"}}>
                <div className="form-box">
                    <form onSubmit={handleSubmit}>

                        <p className="title2">Edit Personal Info</p>
                        <p style={{fontSize: "12px"}} aria-live="polite">{message || '\u00A0'}</p>

                        <div className="text-field">
                            <div className="form-group">
                                <label>Username</label>
                                <input
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="Enter username"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter email"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Phone number</label>
                                <input
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="Enter phone number"
                                />
                            </div>
                        </div>
                        <div style={{ marginTop: '1em' }}>
                            <button type="submit" className="submit-button">Update Personal Info</button>
                        </div>
                    </form>
                </div>
            </div>
            <Footer/>
        </>
    );
}
