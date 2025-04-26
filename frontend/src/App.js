// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminLogin from './components/AdminLogin/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AddBookPage from './pages/AddBookPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/add-book" element={<AddBookPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
