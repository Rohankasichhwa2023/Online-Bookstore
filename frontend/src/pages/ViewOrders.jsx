import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import SideNavbar from '../components/SideNavbar';
import TopNavbar from '../components/TopNavbar';
import '../css/ViewUsers.css';

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

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);

    const admin = useMemo(() => JSON.parse(localStorage.getItem('adminUser') || 'null'), []);

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

    const filteredOrders = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

    if (loading) return <div className="status-msg">Loading orders…</div>;
    if (error) return <div className="status-msg error">Error: {JSON.stringify(error)}</div>;

    return (
        <>
            <SideNavbar />
            <div className="dash-container" style={{marginBottom: "40px"}}>
                <TopNavbar title="Manage Orders" />

                <div className="status-nav">
                    {STATUS_CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            className={`nav-btn ${filter === cat ? 'active' : ''}`}
                            onClick={() => setFilter(cat)}
                        >
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </button>
                    ))}
                </div>

                <table className="users-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>User</th>
                            <th>Phone</th>
                            <th>Address</th>
                            <th>Date</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Payment</th>
                            <th>Actions</th>
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
                                        <button onClick={() => openItemsModal(o.items)} style={{border: "none", backgroundColor: "transparent", textDecoration: "underline", color: "#0a3b6b"}}>
                                            view items
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {modalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <button
                                className="modal-close"
                                onClick={closeModal}
                            >
                                <img src="/icons/close.png"/>
                            </button>
                            <div>
                                <table style={{
                                    width: "580px",
                                    backgroundColor: "#fff",
                                    borderCollapse: "collapse",
                                    border: "1px solid #ccc",
                                }}>
                                    <thead>
                                        <tr>
                                        <th style={{
                                            border: "1px solid #ccc",
                                            padding: "10px",
                                            backgroundColor: "#f9f9f9",
                                            textAlign: "left"
                                        }}>Title</th>
                                        <th style={{
                                            border: "1px solid #ccc",
                                            padding: "10px",
                                            backgroundColor: "#f9f9f9",
                                            textAlign: "left"
                                        }}>Qty</th>
                                        <th style={{
                                            border: "1px solid #ccc",
                                            padding: "10px",
                                            backgroundColor: "#f9f9f9",
                                            textAlign: "left"
                                        }}>Price</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedItems.map((item) => (
                                        <tr key={item.id}>
                                            <td style={{ border: "1px solid #ccc", padding: "10px" }}>{item.book.title}</td>
                                            <td style={{ border: "1px solid #ccc", padding: "10px" }}>{item.quantity}</td>
                                            <td style={{ border: "1px solid #ccc", padding: "10px" }}>Rs {item.price}</td>
                                        </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
