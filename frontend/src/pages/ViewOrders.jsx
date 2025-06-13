import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import '../css/ViewOrders.css';

const TRANSITIONS = {
    pending: ['pending', 'processing', 'shipped', 'cancelled'],
    processing: ['processing', 'shipped', 'cancelled'],
    shipped: ['shipped', 'delivered', 'cancelled'],
    delivered: ['delivered'],
    cancelled: ['cancelled'],
};

const STATUS_CATEGORIES = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function ViewOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);

    const admin = useMemo(
        () => JSON.parse(localStorage.getItem('adminUser') || 'null'),
        []
    );

    useEffect(() => {
        if (!admin?.id) {
            setError({ detail: 'Admin not logged in.' });
            setLoading(false);
            return;
        }
        axios
            .get('http://localhost:8000/orders/admin/orders/', {
                params: { user_id: admin.id },
            })
            .then(({ data }) => {
                setOrders(data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.response?.data || err.message);
                setLoading(false);
            });
    }, [admin?.id]);

    const handleStatusChange = (orderId, newStatus) => {
        axios
            .patch(`http://localhost:8000/orders/admin/orders/${orderId}/status/`, {
                user_id: admin.id,
                status: newStatus,
            })
            .then(({ data }) => {
                setOrders((prev) => prev.map((o) => (o.id === orderId ? data : o)));
            })
            .catch(() => {
                alert('Could not update order status.');
            });
    };

    const openItemsModal = (items) => {
        setSelectedItems(items);
        setModalOpen(true);
    };
    const closeModal = () => {
        setModalOpen(false);
        setSelectedItems([]);
    };

    if (loading) return <p>Loading orders…</p>;
    if (error) return <p className="error">Error: {JSON.stringify(error)}</p>;

    const filteredOrders = filter === 'all'
        ? orders
        : orders.filter((o) => o.status === filter);

    return (
        <div className="view-orders-container">
            <h1 className="title">Admin: Orders</h1>
            <nav className="status-nav">
                {STATUS_CATEGORIES.map((cat) => (
                    <button
                        key={cat}
                        className={`nav-btn ${filter === cat ? 'active' : ''}`}
                        onClick={() => setFilter(cat)}
                    >
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                ))}
            </nav>
            <table className="orders-table">
                <thead>
                    <tr>
                        {['ID', 'User', 'Phone', 'Address', 'Date', 'Total', 'Status', 'Payment', 'Actions'].map((h) => (
                            <th key={h}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {filteredOrders.map((o) => {
                        const options = TRANSITIONS[o.status] || [o.status];
                        const isFixed = options.length === 1;
                        return (
                            <tr key={o.id}>
                                <td>{o.id}</td>
                                <td>{o.user.username}</td>
                                <td>{o.address ? o.address.phone : '—'}</td>
                                <td>{o.address ? `${o.address.address_line}, ${o.address.city}` : '—'}</td>
                                <td>{new Date(o.order_date).toLocaleString()}</td>
                                <td>Rs {o.total_amount}</td>
                                <td>
                                    <select
                                        value={o.status}
                                        onChange={(e) => handleStatusChange(o.id, e.target.value)}
                                        disabled={isFixed}
                                    >
                                        {options.map((s) => (
                                            <option key={s} value={s}>
                                                {s.charAt(0).toUpperCase() + s.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td>
                                    {o.payment
                                        ? `${o.payment.status.charAt(0).toUpperCase() + o.payment.status.slice(1)} / ${o.payment.method.toUpperCase()}`
                                        : '—'}
                                </td>
                                <td>
                                    <button onClick={() => openItemsModal(o.items)} className="btn">
                                        View Items
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {/* Modal */}
            {modalOpen && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <h2>Order Items</h2>
                        <table className="items-table">
                            <thead>
                                <tr><th>Title</th><th>Qty</th><th>Price</th></tr>
                            </thead>
                            <tbody>
                                {selectedItems.map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.book.title}</td>
                                        <td>{item.quantity}</td>
                                        <td>Rs {item.price}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button className="close-btn" onClick={closeModal}>X</button>
                    </div>
                </div>
            )}
        </div>
    );
}