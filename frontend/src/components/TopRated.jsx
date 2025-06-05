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

  const [mainIndex, setMainIndex] = useState(2);

  const shiftLeft = () => {
    if (mainIndex > 0) setMainIndex(mainIndex - 1);
  };

  const shiftRight = () => {
    if (mainIndex < imageSources.length - 1) setMainIndex(mainIndex + 1);
  };

  return (
    <div className="absolute-gallery">
      <button className="left-right-btn2" onClick={shiftLeft}>&lt;</button>

      {imageSources.map((src, index) => {
        const offset = index - mainIndex;
        if (Math.abs(offset) > 2) return null;

        return (
          <img
            key={index}
            src={src}
            alt={`Image ${index + 1}`}
            className={`gallery-image image-${offset}`}
          />
        );
      })}

      <button className="left-right-btn2"onClick={shiftRight}>&gt;</button>
    </div>
  );
}
