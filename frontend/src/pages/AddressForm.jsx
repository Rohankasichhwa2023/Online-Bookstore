import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../css/LoginPage.css';

export default function AddressForm() {
    const stored = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = stored.id;

    const [addresses, setAddresses] = useState([]);
    const [form, setForm] = useState({
        full_name: '', phone: '',
        address_line: '', city: '',
        postal_code: '', is_default: false
    });
    const [message, setMessage] = useState('');

    // Fetch list
    const fetchAddresses = () => {
        axios
            .get(`http://localhost:8000/users/addresses/?user_id=${userId}`)
            .then(res => setAddresses(res.data))
            .catch(() => setMessage('Failed to load addresses'));
    };

    useEffect(fetchAddresses, [userId]);

    // Form handlers
    const handleChange = e => {
        const { name, value, type, checked } = e.target;
        setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleAdd = e => {
        e.preventDefault();
        setMessage('');
        axios.post('http://localhost:8000/users/addresses/', { ...form, user: userId })
            .then(() => {
                setMessage('Address added successfully.');
                setForm({ full_name: '', phone: '', address_line: '', city: '', postal_code: '', is_default: false });
                fetchAddresses();
            })
            .catch(err => setMessage(err.response?.data?.error || 'Failed to add address.'));
    };

    const handleDelete = id => {
        const confirmed = window.confirm("Are you sure you want to delete this address?");
        if (!confirmed) return;

        axios.delete(`http://localhost:8000/users/addresses/${id}/`)
            .then(() => {
                setMessage('Address deleted successfully.');
                fetchAddresses();
            })
            .catch(() => setMessage('Delete failed'));
    };

    const handleDefault = id => {
        const confirmed = window.confirm("Are you sure you want to set this address as default?");
        if (!confirmed) return;

        axios.put(`http://localhost:8000/users/addresses/${id}/`, { is_default: true })
            .then(() => {
                setMessage('Default updated successfully.');
                fetchAddresses();
            })
            .catch(() => setMessage('Set default failed'));
    };

    return (
        <>
            <Navbar/>
            <div style={{padding: "140px 100px 122px 100px", display: "flex", justifyContent: "center", gap: "40px"}}>
                <div className="form-box">
                    <form onSubmit={handleAdd}>

                        <p className="title2" style={{margin: "0px", padding: "0px"}}>Add Address</p>
                        <p style={{fontSize: "12px", color: "black", padding: "4px 4px 8px 4px", margin: "0px"}} aria-live="polite">{message || '\u00A0'}</p>
                        
                        <div className="text-field">
                            <div className="form-group">
                                <input name="full_name" placeholder="Enter full name" value={form.full_name} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <input name="phone" placeholder="Enter phone" value={form.phone} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <textarea name="address_line" placeholder="Enter address line" value={form.address_line} onChange={handleChange} required style={{paddingTop: "4px"}}/>
                            </div>
                            <div className="form-group">
                                <input name="city" placeholder="Enter city name" value={form.city} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <input name="postal_code" placeholder="Enter postal Code" value={form.postal_code} onChange={handleChange} />
                            </div>
                            <div style={{display: "flex", alignItems: "center", gap: "12px", margin: "0px", padding: "0px", height: "18px"}}>                  
                                <input type="checkbox" name="is_default" checked={form.is_default} onChange={handleChange} />
                                <label style={{margin: "0px", padding: "0px"}}>Set as default</label>
                            </div>
                        </div>
                        <div style={{ marginTop: '1em' }}>
                            <button type="submit" className="submit-button">Add Address</button>
                        </div>
                    </form>
                </div>

                <div>
                    <table className="address-table">
                        <thead>
                            <tr>
                                <th>Full Name</th><th>Phone</th><th>Address</th><th>City</th><th>Postal</th><th>Default</th><th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {addresses.map(addr => (
                                <tr key={addr.id}>
                                    <td>{addr.full_name}</td>
                                    <td>{addr.phone}</td>
                                    <td>{addr.address_line}</td>
                                    <td>{addr.city}</td>
                                    <td>{addr.postal_code}</td>
                                    <td style={{width: "130px"}}>
                                        {addr.is_default
                                            ? 'Yes'
                                            : <button style={{fontSize:"13px", border: "none", backgroundColor: "transparent", textDecoration: "underline", color: "#0a3b6b"}} onClick={() => handleDefault(addr.id)}>Set as default</button>
                                        }
                                    </td>
                                    <td>
                                        <button className="close-btn2" onClick={() => handleDelete(addr.id)}><img src="/icons/close.png" className="icon2" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            </div>
            <Footer/>
        </>
    );
}
