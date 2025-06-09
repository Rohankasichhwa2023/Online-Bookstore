import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AddBookPage from './pages/AddBookPage';
import ViewBookPage from './pages/ViewBookPage';
import EditBookPage from './pages/EditBookPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import CartPage from './pages/CartPage';
import FavoritesPage from './pages/FavoritesPage';
import ShopPage from './pages/ShopPage';
import BookDetailsPage from './pages/BookDetailsPage';

import { CartProvider } from './context/CartContext';
import { FavoritesProvider } from './context/FavoritesContext';
import CheckoutPage from './pages/CheckoutPage';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFail from './pages/PaymentFail';
import PollPaymentStatus from './pages/PollPaymentStatus';
import OrderSuccessPage from './pages/OrderSuccessPage';
import OrderFailPage from './pages/OrderFailPage';
import OrdersPage from './pages/OrdersPage';
import RequestBook from './pages/RequestBook';
import EditPersonalInfo from './pages/EditPersonalInfo';
import ChangePassword from './pages/ChangePassword';
import AddressForm from './pages/AddressForm';
import ViewOrders from './pages/ViewOrders';
import ViewBookRequest from './pages/ViewBookRequest';


function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <FavoritesProvider>
          <Routes>
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/add-book" element={<AddBookPage />} />
            <Route path="/view-books" element={<ViewBookPage />} />
            <Route path="/view-orders" element={<ViewOrders />} />
            <Route path="/view-books-request" element={<ViewBookRequest />} />
            <Route path="/edit-book/:id" element={<EditBookPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/book/:id" element={<BookDetailsPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/payment-success/:id" element={<PaymentSuccess />} />
            <Route path="/payment-fail/:id" element={<PaymentFail />} />
            <Route path="/orders/status/:id" element={<PollPaymentStatus />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
            <Route path="/order-fail/:orderId" element={<OrderFailPage />} />
            <Route path="/request-book" element={<RequestBook />} />
            <Route path="/edit-personal-info" element={<EditPersonalInfo />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/address" element={<AddressForm />} />
          </Routes>
        </FavoritesProvider>
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;
