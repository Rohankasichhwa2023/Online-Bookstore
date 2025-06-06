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

    const bookNames = [
        "Night circus",
        "Atomic Habits",
        "A brief History of Time",
        "Mistborn",
        "Becomming"
    ];

    const [mainIndex, setMainIndex] = useState(0);

    const shiftLeft = () => {
        if (mainIndex > 0) setMainIndex(mainIndex - 1);
    };

    const shiftRight = () => {
        if (mainIndex < imageSources.length - 1) setMainIndex(mainIndex + 1);
    };

    return (
        <>
            {/* Display current book name */}
            <p className="best-seller-name">{bookNames[mainIndex]}</p>

            <div className="image-gallery">
                <button onClick={shiftLeft} className="left-right-btn"><img src="/icons/left.png"/></button>
                {imageSources.map((src, index) => (
                    <img
                    key={index}
                    src={src}
                    alt={`Image ${index + 1}`}
                    className={index === mainIndex ? "main-image" : "side-image"}
                    />
                ))}
                <button onClick={shiftRight} className="left-right-btn"><img src="/icons/right.png"/></button>
            </div>
        </>
    );
}
