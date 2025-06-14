import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import SideNavbar from '../components/SideNavbar';
import TopNavbar from '../components/TopNavbar';
import "../css/LoginPage.css";

const AddBookPage = () => {
  const navigate = useNavigate();

  const [availableGenres, setAvailableGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [newGenres, setNewGenres] = useState(''); // comma-list
  const [bookData, setBookData] = useState({
    title: '', author: '', description: '',
    pages: '', language: '', age_group: '',
    price: '', stock: '', cover_image: null,
  });

  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    axios
      .get('http://localhost:8000/books/genres/')
      .then(res => setAvailableGenres(res.data))
      .catch(console.error);
  }, []);

  const handleChange = e => {
    const { name, value, files } = e.target;
    if (name === 'cover_image') {
      const file = files[0];
      setBookData({ ...bookData, cover_image: file });
      setImagePreview(file ? URL.createObjectURL(file) : null);
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
      Object.entries(bookData).forEach(([k, v]) => formData.append(k, v));

      selectedGenres.forEach(id => formData.append('genres', id));

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

      alert('Book added successfully!');
      navigate('/view-books');
    } catch (error) {
      console.error('Error adding book:', error.response?.data || error);
      alert('Failed to add book.');
    }
  };

  return (
    <>
      <SideNavbar />
      <div className="dash-container" style={{marginBottom:"40px"}}>
        <TopNavbar title="Add Book" />
        <div style={{ display: "flex", gap: "32px" }}>
          <div>
            <button className="back-btn" onClick={() => navigate(-1)}>
              <img src="/icons/left.png" alt="Back" />
            </button>
          </div>
          <div className='form-box' style={{ width: "100%" }}>
            <form onSubmit={handleSubmit}>
              <div className="text-field">

                <div style={{display:"flex",flexDirection:"column", gap:"12px"}}>
                  <div style={{display: "flex", alignItems:"center", gap: "12px"}}>
                    <label>Book Cover</label>
                    <input name="cover_image" type="file" onChange={handleChange}/>
                  </div>
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{ height: '300px', width: '220px',  borderRadius: '6px' }}
                    />
                  )}
                </div>

                <div className="form-group">
                  <label>Book Title</label>
                  <input name="title" placeholder="Enter book title" onChange={handleChange} required />
                </div>

                <div className="form-group">
                  <label>Book Author</label>
                  <input name="author" placeholder="Enter book author" onChange={handleChange} required />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea name="description" placeholder="Enter book description" onChange={handleChange} />
                </div>

                <div className="form-row">
                  <div className="form-group small">
                    <label>Pages</label>
                    <input name="pages" type="number" placeholder="Pages" onChange={handleChange} />
                  </div>

                  <div className="form-group small">
                    <label>Language</label>
                    <input name="language" placeholder="Language" onChange={handleChange} required />
                  </div>

                  <div className="form-group small">
                    <label>Age Group</label>
                    <input name="age_group" placeholder="Age Group" onChange={handleChange} />
                  </div>

                  <div className="form-group small">
                    <label>Price</label>
                    <input name="price" type="number" step="0.01" placeholder="Price" onChange={handleChange} required />
                  </div>

                  <div className="form-group small">
                    <label>Stock</label>
                    <input name="stock" type="number" placeholder="Stock" onChange={handleChange} required />
                  </div>
                </div>

                <div className="form-group">
                  <label>Select Genres</label>
                  <div className="checkbox-group">
                    {availableGenres.map(g => (
                      <label key={g.id} style={{ display: "flex", gap: "8px", alignItems:"center"}}>
                        <input
                          type="checkbox"
                          value={g.id}
                          checked={selectedGenres.includes(String(g.id)) || selectedGenres.includes(g.id)}
                          onChange={(e) => {
                            const value = e.target.value;
                            setSelectedGenres(prev =>
                              prev.includes(value)
                                ? prev.filter(id => id !== value)
                                : [...prev, value]
                            );
                          }}
                        />
                        {' '}{g.name}
                      </label>
                    ))}
                  </div>
                </div>

                <div style={{display: "flex", alignItems:"center", gap: "12px"}}>
                  <label>Add New Genres</label>
                  <input
                    type="text"
                    placeholder="e.g. Mystery, Poetry"
                    value={newGenres}
                    onChange={e => setNewGenres(e.target.value)}
                    style={{width:"300px"}}
                  />                  
                </div>
              </div>

              <div style={{ marginTop: '1em', textAlign: "right"}}>
                <button type="submit" className="submit-button" style={{width: "fit-content", padding: "0px 24px"}}>Add Book</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddBookPage;
