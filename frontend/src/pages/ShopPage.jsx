// ShopPage.jsx
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import BestSellers from '../components/BestSellers';
import TopRated from '../components/TopRated';
import AllBooks from '../components/AllBooks';
import Footer from '../components/Footer';
import '../css/ShopPage.css';

const ShopPage = () => {
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <>
            <Navbar />
            <div className="ShopPage-container">
                <BestSellers />
                <TopRated />

                <h1>All Books</h1>

                {/* Search Bar */}
                <div style={{ marginBottom: '16px' }}>
                    <input
                        type="text"
                        placeholder="Search by title, author, language or category…"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            maxWidth: '400px',
                            padding: '8px',
                            fontSize: '16px',
                            borderRadius: '4px',
                            border: '1px solid #ccc'
                        }}
                    />
                </div>

                <AllBooks filter={searchTerm} />
            </div>
            <Footer />
        </>
    );
};

export default ShopPage;