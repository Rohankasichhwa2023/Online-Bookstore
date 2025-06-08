import React, { useState } from 'react';
import "../css/TopRated.css";

export default function TopRated() {
  const imageSources = [
    "/book-images/hp1.jpg",
    "/book-images/hp2.jpg",
    "/book-images/hp3.jpg",
    "/book-images/hp4.jpg",
    "/book-images/hp5.jpg"
  ];

  const bookNames = [
    "Harry Potter and the Philosopher's Stone",
    "Harry Potter and the Chamber of Secrets",
    "Harry Potter and the Prisoner of Azkaban",
    "Harry Potter and the Goblet of Fire",
    "Harry Potter and the Order of the Phoenix"
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
      <h1 style={{marginBottom: "20px"}}>Top Rated</h1>
      {/* Display current book name */}
      <p className="book-name">{bookNames[mainIndex]}</p>

      <div className="absolute-gallery">
        <button className="left-right-btn2" onClick={shiftLeft}><img src="/icons/left.png" /></button>

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

        <button className="left-right-btn2" onClick={shiftRight}><img src="/icons/right.png" /></button>
      </div>
    </>
  );
}
