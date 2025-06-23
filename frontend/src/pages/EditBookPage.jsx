import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import SideNavbar from '../components/SideNavbar';
import TopNavbar from '../components/TopNavbar';
import "../css/LoginPage.css";

const EditBookPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [availableGenres, setAvailableGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [newGenres, setNewGenres] = useState('');
  const [initialCoverUrl, setInitialCoverUrl] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [bookData, setBookData] = useState({
    title: '',
    author: '',
    description: '',
    pages: '',
    language: '',
    age_group: '',
    price: '',
    stock: '',
    cover_image: null,
  });

  useEffect(() => {
    axios.get('http://localhost:8000/books/genres/')
      .then(res => setAvailableGenres(res.data))
      .catch(console.error);

    axios.get(`http://localhost:8000/books/all-books/`)
      .then(res => {
        const book = res.data.find(b => b.id === parseInt(id));
        if (book) {
          setBookData({
            title: book.title,
            author: book.author,
            description: book.description,
            pages: book.pages,
            language: book.language,
            age_group: book.age_group,
            price: book.price,
            stock: book.stock,
            cover_image: null,
          });
          setSelectedGenres(book.genres.map(g => String(g.id)));
          setInitialCoverUrl(book.cover_image);
        }
      })
      .catch(console.error);
  }, [id]);

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

  const handleSubmit = async e => {
    e.preventDefault();
    const formData = new FormData();

    Object.entries(bookData).forEach(([key, value]) => {
      formData.append(key, value);
    });

    selectedGenres.forEach(id => formData.append('genres', id));

    newGenres
      .split(',')
      .map(n => n.trim())
      .filter(n => n)
      .forEach(name => formData.append('new_genres', name));

    try {
      await axios.put(
        `http://localhost:8000/books/update-book/${id}/`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      alert("Book updated successfully.");
      navigate('/view-books');
    } catch (error) {
      console.error("Update failed:", error.response?.data || error);
      alert("Error updating book.");
    }
  };

  return (
    <>
      <SideNavbar />
      <div className="dash-container" style={{ marginBottom: "40px" }}>
        <TopNavbar title="Edit Book" />
        <div style={{ display: "flex", gap: "32px" }}>
          <div>
            <button className="back-btn" onClick={() => navigate(-1)}>
              <img src="/icons/left.png" alt="Back" />
            </button>
          </div>
          <div className='form-box' style={{ width: "100%" }}>
            <form onSubmit={handleSubmit}>

              <div className="text-field">
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <label>Book Cover</label>
                    <input name="cover_image" type="file" onChange={handleChange} />
                  </div>
                  {(imagePreview || initialCoverUrl) && (
                    <img
                      src={imagePreview || initialCoverUrl}
                      alt="Preview"
                      style={{ height: '300px', width: '220px', borderRadius: '6px' }}
                    />
                  )}
                </div>

                <div className="form-group">
                  <label>Book Title</label>
                  <input name="title" value={bookData.title} onChange={handleChange} required />
                </div>

                <div className="form-group">
                  <label>Book Author</label>
                  <input name="author" value={bookData.author} onChange={handleChange} required />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea name="description" value={bookData.description} onChange={handleChange} />
                </div>

                <div className="form-row">
                  <div className="form-group small">
                    <label>Pages</label>
                    <input name="pages" type="number" value={bookData.pages} onChange={handleChange} />
                  </div>

                  <div className="form-group small">
                    <label>Language</label>
                    <input name="language" value={bookData.language} onChange={handleChange} required />
                  </div>

                  <div className="form-group small">
                    <label>Age Group</label>
                    <input name="age_group" value={bookData.age_group} onChange={handleChange} />
                  </div>

                  <div className="form-group small">
                    <label>Price</label>
                    <input name="price" type="number" step="0.01" value={bookData.price} onChange={handleChange} required />
                  </div>

                  <div className="form-group small">
                    <label>Stock</label>
                    <input name="stock" type="number" value={bookData.stock} onChange={handleChange} required />
                  </div>
                </div>

                <div className="form-group">
                  <label>Select Genres</label>
                  <div className="checkbox-group">
                    {availableGenres.map(g => (
                      <label key={g.id} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
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
                        {g.name}
                      </label>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <label>Add New Genres</label>
                  <input
                    type="text"
                    placeholder="e.g. Mystery, Poetry"
                    value={newGenres}
                    onChange={e => setNewGenres(e.target.value)}
                    style={{ width: "300px" }}
                  />
                </div>
              </div>

              <div style={{ marginTop: '1em', textAlign: "right" }}>
                <button type="submit" className="submit-button" style={{ width: "fit-content", padding: "0px 24px" }}>
                  Update Book
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditBookPage;
