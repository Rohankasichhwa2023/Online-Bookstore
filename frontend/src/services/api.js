import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

export const fetchBooks = async () => {
  try {
    const response = await axios.get(`${API_URL}/books/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching books:", error);
    throw error;
  }
};
