import React, { useState } from 'react';
import "../css/BestSellers.css";

export default function BestSellers() {
    const imageSources = [
        "/book-images/1.jpg",
        "/book-images/2.jpg",
        "/book-images/3.jpg",
        "/book-images/4.jpg",
        "/book-images/5.jpg"
    ];

    const [mainIndex, setMainIndex] = useState(0);

    const shiftLeft = () => {
        if (mainIndex > 0) setMainIndex(mainIndex - 1);
    };

    const shiftRight = () => {
        if (mainIndex < imageSources.length - 1) setMainIndex(mainIndex + 1);
    };

    return (
        <div className="image-gallery">
        <button onClick={shiftLeft} className="left-right-btn">&lt;</button>
        {imageSources.map((src, index) => (
            <img
            key={index}
            src={src}
            alt={`Image ${index + 1}`}
            className={index === mainIndex ? "main-image" : "side-image"}
            />
        ))}
        <button onClick={shiftRight} className="left-right-btn">&gt;</button>
        </div>
    );
}
