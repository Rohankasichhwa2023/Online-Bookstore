import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "../css/TopRated.css";

export default function TopRated() {

  const defaultItems = [
    { cover_image: '/book-images/hp1.jpg', title: "Harry Potter and the Philosopher's Stone" },
    { cover_image: '/book-images/hp2.jpg', title: "Harry Potter and the Chamber of Secrets" },
    { cover_image: '/book-images/hp3.jpg', title: "Harry Potter and the Prisoner of Azkaban" },
    { cover_image: '/book-images/hp4.jpg', title: "Harry Potter and the Goblet of Fire" },
    { cover_image: '/book-images/hp5.jpg', title: "Harry Potter and the Order of the Phoenix" },
  ];

  const [items, setItems] = useState(defaultItems);
  const [mainIndex, setMainIndex] = useState(2);

  useEffect(() => {

    axios.get('http://localhost:8000/admin_logs/dashboard-stats/')
      .then(({ data }) => {
        if (data.highestRated && data.highestRated.length > 0) {
          const fetched = data.highestRated.map(b => ({
            cover_image: b.cover_image,
            title: b.title
          }));
          setItems(fetched);
        }
      })
      .catch(err => console.error('Error fetching top-rated books:', err));
  }, []);

  const shiftLeft = () => {
    if (mainIndex > 0) setMainIndex(mainIndex - 1);
  };

  const shiftRight = () => {
    if (mainIndex < items.length - 1) setMainIndex(mainIndex + 1);
  };

  return (
    <div className="top-rated-container">
      <h1>Top Rated</h1>
      <p className="book-name">{items[mainIndex].title}</p>

      <div className="absolute-gallery">
        <button className="left-right-btn2" onClick={shiftLeft}>
          <img src="/icons/left.png" alt="Previous" />
        </button>

        {items.map((item, index) => {
          const offset = index - mainIndex;
          if (Math.abs(offset) > 2) return null;
          return (
            <img
              key={index}
              src={item.cover_image}
              alt={item.title}
              className={`gallery-image image-${offset}`}
            />
          );
        })}

        <button className="left-right-btn2" onClick={shiftRight}>
          <img src="/icons/right.png" alt="Next" />
        </button>
      </div>
    </div>
  );
}
