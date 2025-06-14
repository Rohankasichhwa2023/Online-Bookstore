import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SideNavbar from '../components/SideNavbar';
import TopNavbar from '../components/TopNavbar';
import "../css/ViewBookPage.css";

const ViewBookPage = () => {
    const [stockFilter, setStockFilter] = useState('all');

    const [books, setBooks] = useState([]);
    const [selectedBook, setSelectedBook] = useState(null);
    const [filter, setFilter] = useState('');
    const [categories, setCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef();

    const navigate = useNavigate();

    useEffect(() => {
        fetchBooks();
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleClickOutside = (e) => {
        if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
            setDropdownOpen(false);
        }
    };

    const fetchBooks = async () => {
        try {
            const res = await axios.get('http://localhost:8000/books/all-books/');
            setBooks(res.data);

            const allCats = new Set();
            res.data.forEach(b => {
                if (Array.isArray(b.genres)) {
                    b.genres.forEach(g => allCats.add(g.name));
                }
            });
            setCategories([...allCats]);
        } catch (error) {
            console.error('Error fetching books:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this book?")) return;
        try {
            await axios.delete(`http://localhost:8000/books/delete-book/${id}/`);
            alert('Book deleted successfully.');
            setBooks(prev => prev.filter(book => book.id !== id));
        } catch (error) {
            console.error('Error deleting book:', error);
            alert('Failed to delete book.');
        }
    };

    const truncate = (text, maxLength) =>
        text.length > maxLength ? text.slice(0, maxLength) + '...' : text;

    const filteredBooks = books.filter(book => {
        const term = filter.trim().toLowerCase();
        const textMatch =
            !term ||
            book.title.toLowerCase().includes(term) ||
            book.author.toLowerCase().includes(term) ||
            book.language.toLowerCase().includes(term) ||
            (book.genres && book.genres.some(g => g.name.toLowerCase().includes(term)));

        const categoryMatch =
            selectedCategories.length === 0 ||
            (book.genres && book.genres.some(g => selectedCategories.includes(g.name)));

        const stockMatch =
        stockFilter === 'all' ||
        (stockFilter === 'in' && book.stock > 0) ||
        (stockFilter === 'out' && book.stock === 0);

        return textMatch && categoryMatch && stockMatch;
    });

    return (
        <>
            <SideNavbar />
            <div className="dash-container">
                <TopNavbar title="Manage Books" />
                
                <div className="filter-bar">                    

                    <div ref={dropdownRef} style={{ position: 'relative' }}>
                        <button onClick={() => setDropdownOpen(o => !o)} className="filter-btn">
                            <img src="/icons/filter.png" style={{ height: "24px", width: "24px" }} />
                        </button>
                        {dropdownOpen && (
                            <div
                                style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    zIndex: 10,
                                    width: '180px',
                                    maxHeight: '200px',
                                    overflowY: 'auto',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    background: '#fff',
                                    padding: '12px',
                                    marginTop: "6px"
                                }}
                            >
                                {categories.map(cat => (
                                    <label key={cat} className="category">
                                        <input
                                            type="checkbox"
                                            checked={selectedCategories.includes(cat)}
                                            onChange={() => {
                                                setSelectedCategories(prev =>
                                                    prev.includes(cat)
                                                        ? prev.filter(c => c !== cat)
                                                        : [...prev, cat]
                                                );
                                            }}
                                        />{' '}
                                        {cat}
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="search-bar">
                        <img src="/icons/search.png" style={{ height: "24px", width: "24px" }} />
                        <input
                            type="text"
                            placeholder="Search by title, author, language or genre…"
                            value={filter}
                            onChange={e => setFilter(e.target.value)}
                        />
                    </div>
                    <div>
                        <button
                            onClick={() => setStockFilter('all')}
                            className={`filter-stock-btn ${stockFilter === 'all' ? 'active' : ''}`}
                        >
                            All
                        </button>
                    </div>
                    <div>
                        <button
                            onClick={() => setStockFilter('in')}
                            className={`filter-stock-btn ${stockFilter === 'in' ? 'active' : ''}`}
                        >
                            In Stock
                        </button>
                    </div>
                    <div>
                        <button
                            onClick={() => setStockFilter('out')}
                            className={`filter-stock-btn ${stockFilter === 'out' ? 'active' : ''}`}
                        >
                            Out of Stock
                        </button>
                    </div>
                </div>

                <div className="chip-bar">
                    {selectedCategories.length > 0 ? (
                        selectedCategories.map((category) => (
                        <div key={category} className="chip">
                            <img src="/icons/tick.png" style={{height: "16px", width: "16px"}}/><p>{category}</p>
                        </div>
                        ))
                    ) : (
                        <p style={{margin: "0px", padding: "0px", height: "31px"}}>{'\u00A0'}</p>
                    )}
                </div>

                <div className="book-grid2">
                    {filteredBooks.length > 0 ? (
                        filteredBooks.map(book => (
                            <div
                                key={book.id}
                                className="book-card2"
                                onClick={() => setSelectedBook(book)}
                            >
                                <div style={{ display: "flex", alignItems:"center", justifyContent: "space-between" }}>
                                    <div>
                                        <p style={{ color: book.stock > 0 ? "#4CAF50" : "#E74242", margin: "0px", padding: "0px"}}>
                                            {book.stock > 0 ? `In stock (${book.stock})` : "Out of stock"}
                                        </p>
                                    </div>
                                    <div style={{display:"flex", gap:"12px"}}>
                                        <button onClick={(e) => { e.stopPropagation(); navigate(`/edit-book/${book.id}`); }} className='close-btn'>
                                            <img src="/icons/edit-btn.png" style={{ height: "24px", width: "24px" }} />
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); handleDelete(book.id); }} className='close-btn'>
                                            <img src="/icons/delete-btn.png" style={{ height: "24px", width: "24px" }} />
                                        </button>
                                    </div>
                                </div>

                                <div style={{ display: "flex", justifyContent: "center" }}>
                                    {book.cover_image && (
                                        <img src={book.cover_image} alt={book.title} className="b-image" />
                                    )}
                                </div>

                                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                    <h3 style={{ fontSize: "16px", padding: "0px", margin: "0px"}}>{truncate(book.title, 28)}</h3>
                                    <p style={{ color: "#6d6d6d", textAlign:"left", padding: "0px", margin: "0px"}}>{book.author}</p>
                                    <p style={{ color: "#6d6d6d", textAlign:"left", padding: "0px", margin: "0px" }}>{truncate(book.description, 32)}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p style={{ textAlign: 'center', width: "100%" }}>No books match your search.</p>
                    )}
                </div>

                {selectedBook && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <button
                                className="modal-close"
                                onClick={() => setSelectedBook(null)}
                            >
                                <img src="/icons/close.png"/>
                            </button>
                            <div style={{display: "flex", gap:" 24px"}}>
                                <div>
                                    {selectedBook.cover_image && (
                                        <img
                                            src={selectedBook.cover_image}
                                            alt={selectedBook.title}
                                            className="modal-image"
                                        />
                                    )}
                                </div>
                                
                                <div style={{width: "420px", display: "flex", flexDirection: "column", gap: "4px"}}>
                                    <h2 style={{fontSize:"20px", margin: "0px", padding: "0px"}}>{selectedBook.title}</h2>
                                    <p  style={{textAlign:"left", margin: "0px", padding: "0px", color: "#6d6d6d", fontSize:"16px"}}>{selectedBook.author}</p>
                                    <p  style={{textAlign:"left", margin: "0px", padding: "0px", color: "#6d6d6d", fontSize:"16px"}}>{selectedBook.description}</p><br/>
                                    <p style={{textAlign:"left", margin: "0px", padding: "0px", fontSize:"16px"}}><strong>Genres:</strong> {selectedBook.genres.map(g => g.name).join(', ')}</p>
                                    <p style={{textAlign:"left", margin: "0px", padding: "0px", fontSize:"16px"}}><strong>Language:</strong> {selectedBook.language}</p>
                                    <p style={{textAlign:"left", margin: "0px", padding: "0px", fontSize:"16px"}}><strong>Age Group:</strong> {selectedBook.age_group}</p>
                                    <p style={{textAlign:"left", margin: "0px", padding: "0px", fontSize:"16px"}}><strong>Pages:</strong> {selectedBook.pages}</p><br/>
                                    <p style={{textAlign:"left", margin: "0px", padding: "0px", fontSize:"16px"}}><strong>Stock:</strong> {selectedBook.stock}</p>
                                    <p style={{textAlign:"left", margin: "0px", padding: "0px", fontSize:"18px"}}><strong>Rs {selectedBook.price}</strong></p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default ViewBookPage;
