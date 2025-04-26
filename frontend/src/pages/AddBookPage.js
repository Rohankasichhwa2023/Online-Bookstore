// src/pages/AddBookPage.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddBookPage = () => {
  const navigate = useNavigate();

  const [bookData, setBookData] = useState({
        title: '',
        author: '',
        description: '',
        pages: '',
        language: '',
        age_group: '',
        price: '',
        stock: '',
        cover_image: null, // store file object, not string
    });

    const handleChange = (e) => {
        if (e.target.name === 'cover_image') {
            setBookData({ ...bookData, cover_image: e.target.files[0] });
        } else {
            setBookData({ ...bookData, [e.target.name]: e.target.value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            for (const key in bookData) {
            formData.append(key, bookData[key]);
            }

            await axios.post('http://localhost:8000/books/add-book/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            });

            alert('Book added successfully!');
            navigate('/admin-dashboard');
        } catch (error) {
            console.error('Error adding book:', error.response.data);
            alert('Failed to add book.');
        }
    };


  return (
    <div>
      <h2>Add New Book</h2>
      <form onSubmit={handleSubmit}>
        <input name="title" placeholder="Title" onChange={handleChange} required />
        <input name="author" placeholder="Author" onChange={handleChange} required />
        <textarea name="description" placeholder="Description" onChange={handleChange}></textarea>
        <input name="pages" type="number" placeholder="Pages" onChange={handleChange} />
        <input name="language" placeholder="Language" onChange={handleChange} required />
        <input name="age_group" placeholder="Age Group" onChange={handleChange} />
        <input name="price" type="number" placeholder="Price" step="0.01" onChange={handleChange} required />
        <input name="stock" type="number" placeholder="Stock" onChange={handleChange} required />
        <input name="cover_image" type="file" placeholder="Add Cover Image" onChange={handleChange} />
        <button type="submit">Add Book</button>
      </form>
    </div>
  );
};

export default AddBookPage;
