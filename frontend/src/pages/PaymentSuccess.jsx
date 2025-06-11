import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../css/PaymentSuccess.css";

const PaymentSuccess = () => {
    const { id: orderId } = useParams();
    const [statusData, setStatusData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState(null);

    useEffect(() => {
        const pollStatus = async () => {
            try {
                await new Promise((resolve) => setTimeout(resolve, 30000));
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

    return (
        <>
            <Navbar/>
            <div className="payment-success-container">
                <div className="payment-success-box">
                    {loading && (
                        <>
                            <h2>Verifying Status…</h2>
                            <p>Please wait a moment (around 30 seconds).</p>
                        </>
                    )}

                    {!loading && errorMsg && (
                        <>
                            <img src="/icons/failure.png" style={{height: "50px", width: "50px", marginBottom: "8px"}}/>
                            <h2 className="error">Error Verifying Payment</h2>
                            <p>{errorMsg}</p>
                        </>
                    )}

                    {!loading && statusData && (
                        <>
                            <h2>Payment Status for Order #{orderId}</h2>
                            <p><strong>Status:</strong> <span className={statusData.status === 'COMPLETE' ? 'success' : 'pending'}>{statusData.status}</span></p>
                            <p><strong>Reference ID:</strong> {statusData.ref_id}</p>
                            {statusData.status === 'COMPLETE'
                                ? <p className="success"><img src="/icons/success.png" style={{height: "50px", width: "50px"}}/><br/>Your payment has been confirmed. Thank you!</p>
                                : <p className="pending">Your payment is {statusData.status}.</p>}
                        </>
                    )}
                </div>
            </div>
            <Footer/>
        </>
    );
};

export default PaymentSuccess;
