import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddBookPage = () => {
  const navigate = useNavigate();

  const [availableGenres, setAvailableGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [newGenres, setNewGenres] = useState('');    // comma-list
  const [bookData, setBookData] = useState({
    title: '', author: '', description: '',
    pages: '', language: '', age_group: '',
    price: '', stock: '', cover_image: null,
  });

  useEffect(() => {
    axios
      .get('http://localhost:8000/books/genres/')
      .then(res => setAvailableGenres(res.data))
      .catch(console.error);
  }, []);

  const handleChange = e => {
    const { name, value, files } = e.target;
    if (name === 'cover_image') {
      setBookData({ ...bookData, cover_image: files[0] });
    } else {
      setBookData({ ...bookData, [name]: value });
    }
  };

  const handleGenreChange = e => {
    setSelectedGenres(
      Array.from(e.target.selectedOptions).map(opt => opt.value)
    );
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const formData = new FormData();
      // Book fields
      Object.entries(bookData).forEach(([k, v]) => formData.append(k, v));

      // Existing genre IDs
      selectedGenres.forEach(id => formData.append('genres', id));

      // New genres (split on comma, trim out blanks)
      newGenres
        .split(',')
        .map(n => n.trim())
        .filter(n => n)
        .forEach(name => formData.append('new_genres', name));

      await axios.post(
        'http://localhost:8000/books/add-book/',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      alert('Book + genres added successfully!');
      navigate('/admin-dashboard');
    } catch (error) {
      console.error('Error adding book:', error.response?.data || error);
      alert('Failed to add book.');
    }
  };

  return (
    <div>
      <h2>Add New Book</h2>
      <form onSubmit={handleSubmit}>
        <input name="title" placeholder="Title" onChange={handleChange} required />
        <input name="author" placeholder="Author" onChange={handleChange} required />
        <textarea name="description" placeholder="Description" onChange={handleChange} />
        <input name="pages" type="number" placeholder="Pages" onChange={handleChange} />
        <input name="language" placeholder="Language" onChange={handleChange} required />
        <input name="age_group" placeholder="Age Group" onChange={handleChange} />
        <input name="price" type="number" placeholder="Price" step="0.01" onChange={handleChange} required />
        <input name="stock" type="number" placeholder="Stock" onChange={handleChange} required />
        <input name="cover_image" type="file" onChange={handleChange} />


        <label>
          Select Genres
          <select multiple value={selectedGenres} onChange={handleGenreChange}>
            {availableGenres.map(g => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </label>

        {/* New: comma-separated names */}
        <label>
          New Genres (comma-separated)
          <input
            type="text"
            placeholder="e.g. Mystery, Poetry"
            value={newGenres}
            onChange={e => setNewGenres(e.target.value)}
          />
        </label>

        <button type="submit">Add Book</button>
      </form>
    </div>
  );
};

export default AddBookPage;


