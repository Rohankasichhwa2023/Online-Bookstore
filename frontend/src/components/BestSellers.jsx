import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "../css/BestSellers.css";

export default function BestSellers() {
    // Default fallback data
    const defaultItems = [
        { cover_image: '/book-images/1.jpg', title: 'Night Circus' },
        { cover_image: '/book-images/2.jpg', title: 'Atomic Habits' },
        { cover_image: '/book-images/3.jpg', title: 'A Brief History of Time' },
        { cover_image: '/book-images/4.jpg', title: 'Mistborn' },
        { cover_image: '/book-images/5.jpg', title: 'Becoming' },
    ];

    const [items, setItems] = useState(defaultItems);
    const [mainIndex, setMainIndex] = useState(0);

    useEffect(() => {

        axios.get('http://localhost:8000/admin_logs/dashboard-stats/', {
            params: { limit: 5 }
        })
            .then(({ data }) => {
                if (data.mostSold && data.mostSold.length > 0) {

                    const fetched = data.mostSold.map(b => ({
                        cover_image: b.cover_image,
                        title: b.title
                    }));
                    setItems(fetched);
                }
            })
            .catch(err => {
                console.error('Error fetching best sellers:', err);
            });
    }, []);

    const shiftLeft = () => {
        if (mainIndex > 0) setMainIndex(mainIndex - 1);
    };

    const shiftRight = () => {
        if (mainIndex < items.length - 1) setMainIndex(mainIndex + 1);
    };

    return (
        <div className="best-sellers-container">
            <h1>Best Sellers</h1>
            <p className="best-seller-name">{items[mainIndex].title}</p>

            <div className="image-gallery">
                <button onClick={shiftLeft} className="left-right-btn">
                    <img src="/icons/left.png" alt="Previous" />
                </button>

                {items.map((item, index) => (
                    <img
                        key={index}
                        src={item.cover_image}
                        alt={item.title}
                        className={index === mainIndex ? 'main-image' : 'side-image'}
                    />
                ))}

                <button onClick={shiftRight} className="left-right-btn">
                    <img src="/icons/right.png" alt="Next" />
                </button>
            </div>
        </div>
    );
}
