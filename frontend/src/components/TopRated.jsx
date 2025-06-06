import React, { useState } from 'react';
import "../css/TopRated.css";

export default function TopRated() {
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

  const [mainIndex, setMainIndex] = useState(2);

  const shiftLeft = () => {
    if (mainIndex > 0) setMainIndex(mainIndex - 1);
  };

  const shiftRight = () => {
    if (mainIndex < imageSources.length - 1) setMainIndex(mainIndex + 1);
  };

  return (
    <>
      {/* Display current book name */}
      <p className="book-name">{bookNames[mainIndex]}</p>
      
      <div className="absolute-gallery">
      <button className="left-right-btn2" onClick={shiftLeft}><img src="/icons/left.png"/></button>

      {imageSources.map((src, index) => {
        const offset = index - mainIndex;
        if (Math.abs(offset) > 2) return null;

        return (
          <img
            key={index}
            src={src}
            alt={bookNames[index]}
            className={`gallery-image image-${offset}`}
          />
        );
      })}

      <button className="left-right-btn2" onClick={shiftRight}><img src="/icons/right.png"/></button>
    </div>
    </>
  );
}
