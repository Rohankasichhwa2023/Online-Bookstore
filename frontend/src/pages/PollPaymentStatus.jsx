// src/pages/PollPaymentStatus.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const PollPaymentStatus = () => {
    const { id: orderId } = useParams(); // orderId from URL
    const [statusData, setStatusData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState(null);

    useEffect(() => {
        // Define an async function so we can use await
        const checkStatusAfterDelay = async () => {
            try {
                // 1) Wait 30 seconds before polling
                await new Promise((resolve) => setTimeout(resolve, 30000)); // 30,000 ms = 30 seconds

                // 2) Now call your Django endpoint that wraps eSewa's status-check
                const res = await axios.get(
                    `http://localhost:8000/orders/esewa/status-check/${orderId}/`
                );
                setStatusData(res.data);
            } catch (err) {
                console.error('Error polling payment status:', err.response?.data || err);
                setErrorMsg(
                    err.response?.data?.error_message ||
                    err.response?.data?.detail ||
                    err.message ||
                    'Unknown error'
                );
            } finally {
                setLoading(false);
            }
        };

        checkStatusAfterDelay();
    }, [orderId]);

    if (loading) {
        return (
            <div style={{ padding: '20px' }}>
                <h2>Checking payment status…</h2>
                <p>Please wait a moment (about 30 seconds).</p>
            </div>
        );
    }

    if (errorMsg) {
        return (
            <div style={{ padding: '20px' }}>
                <h2>Error Checking Payment</h2>
                <p>{errorMsg}</p>
            </div>
        );
    }

    // statusData now contains eSewa's response JSON:
    // { product_code, transaction_uuid, total_amount, status, ref_id }
    return (
        <div style={{ padding: '20px' }}>
            <h2>Payment Status for Order #{orderId}</h2>
            <p>
                <strong>Status:</strong> {statusData.status}
            </p>
            <p>
                <strong>Reference ID:</strong> {statusData.ref_id || '—'}
            </p>
            {statusData.status === 'COMPLETE' ? (
                <p>Payment completed successfully!</p>
            ) : (
                <p>Payment is {statusData.status}. Please check again later.</p>
            )}
        </div>
    );
};

export default PollPaymentStatus;
