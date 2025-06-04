import React from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../css/ShopPage.css';
import AllBooks from '../components/AllBooks';

const ShopPage = () => {
    return (
        <>
            <Navbar />
            <div className="ShopPage-container">
                <h1>All Books</h1>
                <AllBooks />
            </div>
            <Footer/>
        </>
    );
};

export default ShopPage;
