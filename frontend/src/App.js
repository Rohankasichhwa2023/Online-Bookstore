import React, { useEffect, useState } from 'react';
import { fetchBooks } from './services/api';

function App() {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    async function getBooks() {
      try {
        const data = await fetchBooks();
        setBooks(data);
      } catch (error) {
        console.error(error);
      }
    }
    getBooks();
  }, []);

  return (
    <div>
      <h1>Online Book Store</h1>
      <ul>
        {books.map(book => (
          <li key={book.id}>
            {book.title} - {book.author} (${book.price})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
