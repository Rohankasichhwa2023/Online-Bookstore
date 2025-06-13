import React, { useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../css/LoginPage.css';

export default function ChangePassword() {
    const stored = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = stored.id;

    const [formData, setFormData] = useState({
        current_password: '',
        new_password: '',
        password2: ''
    });

    const [message, setMessage] = useState('');

    const handleChange = e => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setMessage('');

        if (formData.new_password !== formData.password2) {
            setMessage("New password and confirm password do not match.");
            return;
        }

        try {
            const res = await axios.post(
                `http://localhost:8000/users/change-password/${userId}/`,
                {
                    current_password: formData.current_password,
                    new_password: formData.new_password
                }
            );
            if (res.status === 200) {
                setMessage(res.data.message);
                setFormData({
                    current_password: '',
                    new_password: '',
                    password2: ''
                });
            }
        } catch (err) {
            const errMsg = err.response?.data?.error || 'Password change failed.';
            setMessage(errMsg);
        }
    };

    return (
        <>
            <Navbar/>
            <div style={{paddingTop: "140px", paddingBottom: "152px", display: "flex", justifyContent: "center"}}>
                <div className="form-box">
                    <form onSubmit={handleSubmit}>

                        <p className="title2" style={{margin: "0px", padding: "0px"}}>Change Password</p>
                        <p style={{fontSize: "12px"}} aria-live="polite">{message || '\u00A0'}</p>

                        <div className="text-field">
                            <div className="form-group">
                                <label>Current Password</label>
                                <input
                                    name="current_password"
                                    type="password"
                                    value={formData.current_password}
                                    onChange={handleChange}
                                    placeholder="Enter current password"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>New Password</label>
                                <input
                                    name="new_password"
                                    type="password"
                                    value={formData.new_password}
                                    onChange={handleChange}
                                    placeholder="Enter new password"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="password2">Confirm Password</label>
                                <input
                                    id="password2"
                                    name="password2"
                                    type="password"
                                    value={formData.password2}
                                    onChange={handleChange}
                                    placeholder="Re-enter your new password"
                                    required
                                />
                            </div>
                        </div>

                        <div style={{ marginTop: '1em' }}>
                            <button type="submit" className="submit-button">Update Password</button>
                        </div>
                    </form>
                </div>
            </div>
            <Footer/>
        </>
    );
}
