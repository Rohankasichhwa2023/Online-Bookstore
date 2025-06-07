// src/components/AddressForm.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

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
            .catch(() => setMessage('Failed to load addresses.'));
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
                setMessage('Address added.');
                setForm({ full_name: '', phone: '', address_line: '', city: '', postal_code: '', is_default: false });
                fetchAddresses();
            })
            .catch(err => setMessage(err.response?.data?.error || 'Add failed.'));
    };

    const handleDelete = id => {
        axios.delete(`http://localhost:8000/users/addresses/${id}/`)
            .then(() => {
                setMessage('Address deleted.');
                fetchAddresses();
            })
            .catch(() => setMessage('Delete failed.'));
    };

    const handleDefault = id => {
        axios.put(`http://localhost:8000/users/addresses/${id}/`, { is_default: true })
            .then(() => {
                setMessage('Default updated.');
                fetchAddresses();
            })
            .catch(() => setMessage('Set default failed.'));
    };

    return (
        <div>
            <h2>Add New Address</h2>
            {message && <p>{message}</p>}
            <form onSubmit={handleAdd}>
                <input name="full_name" placeholder="Full Name" value={form.full_name} onChange={handleChange} required />
                <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} required />
                <textarea name="address_line" placeholder="Address Line" value={form.address_line} onChange={handleChange} required />
                <input name="city" placeholder="City" value={form.city} onChange={handleChange} />
                <input name="postal_code" placeholder="Postal Code" value={form.postal_code} onChange={handleChange} />
                <label>
                    <input type="checkbox" name="is_default" checked={form.is_default} onChange={handleChange} />
                    Set as default
                </label>
                <button type="submit">Add Address</button>
            </form>

            <h2>Your Addresses</h2>
            <table border="1" cellPadding="5">
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
                            <td>
                                {addr.is_default
                                    ? 'Yes'
                                    : <button onClick={() => handleDefault(addr.id)}>Set Default</button>
                                }
                            </td>
                            <td>
                                <button onClick={() => handleDelete(addr.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
