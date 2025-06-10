import React, { useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import "../css/LoginPage.css";

export default function RequestBook() {
    const [user] = useState(() => JSON.parse(localStorage.getItem('user')));
    const [formData, setFormData] = useState({
        book_name: '',
        book_author: '',
        language: ''
    });
    const [message, setMessage] = useState('');

    const handleChange = e => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            const payload = {
                user: user.id,
                book_name: formData.book_name,
                book_author: formData.book_author,
                language: formData.language
            };
            const res = await axios.post('http://localhost:8000/books/request-book/', payload);
            if (res.status === 201) {
                setMessage('Thank you. We will get to your request soon!');
                setFormData({ book_name: '', book_author: '', language: '' });
            }
        } catch (err) {
            console.error(err);
            setMessage('Submission failed. Please try again.');
        }
    };

    return (
        <>
            <Navbar/>
            <div style={{paddingTop: "140px", paddingBottom: "90px", display: "flex", justifyContent: "center"}}>                
                <div className="form-box">
                    <form onSubmit={handleSubmit}>

                        <p className="title2" style={{margin: "0px", padding: "0px"}}>Request Book</p>
                        <p style={{fontSize: "12px"}} aria-live="polite">{message || '\u00A0'}</p>
                        
                        <div className="text-field">
                            <div className="form-group">
                                <label>Book Name</label>
                                <input
                                    name="book_name"
                                    value={formData.book_name}
                                    onChange={handleChange}
                                    placeholder="Enter book name"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Author Name</label>
                                <input
                                    name="book_author"
                                    value={formData.book_author}
                                    onChange={handleChange}
                                    placeholder="Enter author's name"
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Language</label>
                                <input
                                    name="language"
                                    value={formData.language}
                                    onChange={handleChange}
                                    placeholder="Enter language preference"
                                />
                            </div>
                            <div style={{ marginTop: '1em' }}>
                                <button type="submit" className="submit-button">Submit Request</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
            <Footer/>
        </>
    );
}


