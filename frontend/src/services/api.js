import axios from 'axios';

const API_URL = 'http://localhost:8000/users/admin-login/';

export const adminLogin = async (username, password) => {
  try {
    const response = await axios.post(API_URL, { username, password });
    return response.data;  // Return the response data (user info)
  } catch (error) {
    throw error;
  }
};
