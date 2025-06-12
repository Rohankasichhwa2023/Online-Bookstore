import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';

const STATUS_CHOICES = [
    'pending',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
];

export default function ViewOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Expect your AdminLogin to have stored { id, is_admin, username, ... }
    const admin = useMemo(
        () => JSON.parse(localStorage.getItem('adminUser') || 'null'),
        []
    );

    useEffect(() => {
        // Ensure we have an admin with an ID
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
                setOrders((prev) =>
                    prev.map((o) => (o.id === orderId ? data : o))
                );
            })
            .catch(() => {
                alert('Could not update order status.');
            });
    };

    if (loading) return <p>Loading orders…</p>;
    if (error)
        return (
            <p className="text-red-600">Error: {JSON.stringify(error)}</p>
        );

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">Admin: All Orders</h1>
            <table className="min-w-full border">
                <thead className="bg-gray-100">
                    <tr>
                        {[
                            'ID',
                            'User',
                            'Phone',
                            'Address',
                            'Date',
                            'Total',
                            'Status',
                            'Payment',
                            'Actions',
                        ].map((h) => (
                            <th key={h} className="px-4 py-2 border">
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {orders.map((o) => (
                        <tr key={o.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 border">{o.id}</td>
                            <td className="px-4 py-2 border">
                                {o.user.username}
                            </td>
                            <td className="px-4 py-2 border">
                                {o.address
                                    ? `${o.address.phone}`
                                    : '—'}
                            </td>
                            <td className="px-4 py-2 border">
                                {o.address
                                    ? `${o.address.address_line},${o.address.city}, ${o.address.postal_code}`
                                    : '—'}
                            </td>
                            <td className="px-4 py-2 border">
                                {new Date(o.order_date).toLocaleString()}
                            </td>
                            <td className="px-4 py-2 border">Rs {o.total_amount}</td>
                            <td className="px-4 py-2 border">
                                <select
                                    value={o.status}
                                    onChange={(e) =>
                                        handleStatusChange(o.id, e.target.value)
                                    }
                                    className="border rounded p-1"
                                >
                                    {STATUS_CHOICES.map((s) => (
                                        <option key={s} value={s}>
                                            {s.charAt(0).toUpperCase() + s.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </td>
                            <td className="px-4 py-2 border">
                                {o.payment
                                    ? o.payment.status.charAt(0).toUpperCase() +
                                    o.payment.status.slice(1)
                                    : '—'}
                            </td>
                            <td className="px-4 py-2 border space-x-2">
                                <button
                                    onClick={() =>
                                        alert(JSON.stringify(o.items, null, 2))
                                    }
                                    className="px-3 py-1 bg-blue-600 text-black rounded"
                                >
                                    View Items
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
