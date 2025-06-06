// src/pages/PaymentSuccess.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const PaymentSuccess = () => {
    const { id: orderId } = useParams();
    const [statusData, setStatusData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState(null);

    useEffect(() => {
        const pollStatus = async () => {
            try {
                // 30-second pause
                await new Promise((resolve) => setTimeout(resolve, 30000));

                // Call your status-check endpoint
                const res = await axios.get(`http://localhost:8000/orders/esewa/status-check/${orderId}/`);
                setStatusData(res.data);
            } catch (err) {
                setErrorMsg(err.response?.data?.error_message || err.message);
            } finally {
                setLoading(false);
            }
        };

        pollStatus();
    }, [orderId]);

    if (loading) {
        return (
            <div style={{ padding: '20px' }}>
                <h2>Payment Successful—Verifying Status…</h2>
                <p>Please wait a moment (around 30 seconds).</p>
            </div>
        );
    }

    if (errorMsg) {
        return (
            <div style={{ padding: '20px' }}>
                <h2>Error Verifying Payment</h2>
                <p>{errorMsg}</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px' }}>
            <h2>Payment Status for Order #{orderId}</h2>
            <p><strong>Status:</strong> {statusData.status}</p>
            <p><strong>Reference ID:</strong> {statusData.ref_id}</p>
            {statusData.status === 'COMPLETE'
                ? <p>Your payment has been confirmed. Thank you!</p>
                : <p>Payment is {statusData.status}. If this is unexpected, please try again later.</p>}
        </div>
    );
};

export default PaymentSuccess;
