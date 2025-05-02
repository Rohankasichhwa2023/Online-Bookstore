import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const EditBookPage = () => {
    const { id } = useParams();
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
        genres: [],
        new_genres: [],
    });
    const [genreList, setGenreList] = useState([]);

    useEffect(() => {
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
                        genres: book.genres.map(g => g.id),
                        new_genres: []
                    });
                }
            });

        axios.get('http://localhost:8000/books/genres/')
            .then(res => setGenreList(res.data));
    }, [id]);

    const handleChange = (e) => {
        setBookData({ ...bookData, [e.target.name]: e.target.value });
    };

    const handleGenreChange = (e) => {
        const options = Array.from(e.target.selectedOptions, opt => parseInt(opt.value));
        setBookData({ ...bookData, genres: options });
    };

    const handleNewGenres = (e) => {
        setBookData({ ...bookData, new_genres: e.target.value.split(',').map(s => s.trim()) });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        for (const key in bookData) {
            if (Array.isArray(bookData[key])) {
                bookData[key].forEach(val => formData.append(key, val));
            } else {
                formData.append(key, bookData[key]);
            }
        }

        try {
            await axios.put(`http://localhost:8000/books/update-book/${id}/`, formData);
            alert("Book updated successfully.");
            navigate('/view-books');
        } catch (error) {
            console.error("Update failed:", error);
            alert("Error updating book.");
        }
    };

    return (
        <>
            <button onClick={() => navigate('/view-books')}> Back to books </button>
            <div>
                <h2>Edit Book</h2>
                <form onSubmit={handleSubmit} encType="multipart/form-data">
                    <input type="text" name="title" value={bookData.title} onChange={handleChange} placeholder="Title" required />
                    <input type="text" name="author" value={bookData.author} onChange={handleChange} placeholder="Author" required />
                    <textarea name="description" value={bookData.description} onChange={handleChange} placeholder="Description" />
                    <input type="number" name="pages" value={bookData.pages} onChange={handleChange} placeholder="Pages" />
                    <input type="text" name="language" value={bookData.language} onChange={handleChange} placeholder="Language" />
                    <input type="text" name="age_group" value={bookData.age_group} onChange={handleChange} placeholder="Age Group" />
                    <input type="number" name="price" value={bookData.price} onChange={handleChange} placeholder="Price" />
                    <input type="number" name="stock" value={bookData.stock} onChange={handleChange} placeholder="Stock" />
                    <label>Select Genres:</label>
                    <select multiple value={bookData.genres} onChange={handleGenreChange}>
                        {genreList.map(g => (
                            <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                    </select>
                    <input type="text" placeholder="New genres (comma-separated)" onChange={handleNewGenres} />
                    <input type="file" name="cover_image" onChange={e => setBookData({ ...bookData, cover_image: e.target.files[0] })} />
                    <button type="submit">Update Book</button>
                </form>
            </div>
        </>
    );
};

export default EditBookPage;
