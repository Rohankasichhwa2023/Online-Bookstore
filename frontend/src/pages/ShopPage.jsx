import React from 'react';
import Navbar from '../components/Navbar';
import BestSellers from '../components/BestSellers';
import TopRated from '../components/TopRated';
import AllBooks from '../components/AllBooks';
import Footer from '../components/Footer';
import '../css/ShopPage.css';

const ShopPage = () => {
    return (
        <>
            <Navbar />
            <div className="ShopPage-container">
                <h1>Best Sellers</h1>
                <BestSellers />
                <h1>Top Rated</h1>
                <TopRated />
                <h1>All Books</h1>
                <AllBooks />
            </div>
            <Footer/>
        </>
    );
};

export default ShopPage;
