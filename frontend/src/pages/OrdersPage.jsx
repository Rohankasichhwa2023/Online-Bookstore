import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../css/OrdersPage.css';

const OrdersPage = () => {
  const navigate = useNavigate();
  const user = useMemo(() => JSON.parse(localStorage.getItem('user') || 'null'), []);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    (async () => {
      setLoading(true);
      try {
        const res = await axios.get('http://localhost:8000/orders/list/', {
          params: { user_id: user.id },
        });
        setOrders(res.data);
      } catch (err) {
        setError('Unable to load orders.');
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate, user]);

  const handleEsewaPayNow = async (orderId) => {
    try {
      const res = await axios.post(
        'http://localhost:8000/orders/get-esewa-payment-data/',
        { order_id: orderId }
      );
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';
      Object.entries(res.data).forEach(([k, v]) => {
        const inp = document.createElement('input');
        inp.type = 'hidden';
        inp.name = k;
        inp.value = v;
        form.appendChild(inp);
      });
      document.body.appendChild(form);
      form.submit();
    } catch {
      alert('Unable to initiate eSewa payment. Please try again.');
    }
  };

  const handleKhaltiPayNow = async (orderId) => {
    try {
      const res = await axios.get(
        `http://localhost:8000/orders/khalti/pay-now/${orderId}/`
      );
      if (res.data.payment_url) {
        window.location.href = res.data.payment_url;
      } else {
        alert('Unable to initiate Khalti payment. Please try again.');
      }
    } catch {
      alert('Unable to initiate Khalti payment. Please try again.');
    }
  };

  if (!user) return null;

  return (
    <>
      <Navbar />
      <div className="orders-container">
        <h1>Order History</h1>

        {loading && <div className="status-msg">Loading your orders…</div>}
        {error && <div className="status-msg error">{error}</div>}

        {!loading && !error && orders.length === 0 && (
          <div className="status-msg">You have not placed any orders yet.</div>
        )}

        <div className="orders-list">
          {orders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-items">
                <h3 style={{ padding: "0px 0px 12px 0px", margin: "0px", color: "#0E4783", borderBottom: "2px solid #ccc" }}>Order Summary</h3>
                {order.items.map((item, idx) => (
                  <div key={idx} className="item-card">
                    <img
                      src={`http://localhost:8000${item.book.cover_image}`}
                      alt={item.book.title}
                      className="item-img"
                    />
                    <div className="item-info">
                      <p className="item-title" style={{ fontSize: "16px" }}>{item.book.title}</p>
                      <strong><p className="item-title">Rs {item.quantity * item.price}</p></strong>
                    </div>
                  </div>
                ))}
              </div>
              <div className="order-header">
                <div>Order ID: {order.id}</div>
                <div>Order Status: {order.status}</div>
                <div>Date: {new Date(order.order_date).toLocaleString()}</div>
                <div>Address: {order.address
                  ? `${order.address.address_line}, ${order.address.city}`
                  : '—'}
                </div>
                <div>Payment: {capitalize(order.payment_method)}</div>
                <div>Payment Status: {capitalize(order.payment_status)}</div>
                <div>Total: Rs {order.total_amount}</div>
                {order.payment_status === 'pending' && (
                  <div className="pay-now-btn-wrapper">
                    {order.payment_method === 'esewa' ? (
                      <button
                        className="pay-now-btn esewa"
                        onClick={() => handleEsewaPayNow(order.id)}
                      >Pay with eSewa</button>
                    ) : (
                      <button
                        className="pay-now-btn khalti"
                        onClick={() => handleKhaltiPayNow(order.id)}
                      >Pay with Khalti</button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
};

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
}

export default OrdersPage;
