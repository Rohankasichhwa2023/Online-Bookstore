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
        const poll = async () => {
            try {
                // wait a few seconds for eSewa → backend update
                await new Promise(r => setTimeout(r, 5000));
                const res = await axios.get(
                    `http://localhost:8000/orders/esewa/status-check/${orderId}/`
                );
                setStatusData(res.data);
            } catch (err) {
                setErrorMsg(err.response?.data?.detail || err.message);
            } finally {
                setLoading(false);
            }
        };
        poll();
    }, [orderId]);

    return (
        <>
            <Navbar />
            <div className="payment-success-container">
                <div className="payment-success-box">
                    {loading && (
                        <>
                            <h2>Verifying…</h2>
                            <p>Please wait a moment.</p>
                        </>
                    )}

                    {!loading && errorMsg && (
                        <>
                            <img src="/icons/failure.png" alt="fail" />
                            <h2 className="error">Error</h2>
                            <p>{errorMsg}</p>
                        </>
                    )}

                    {!loading && statusData && (
                        <>
                            <img src="/icons/success.png" style={{height: "50px", width: "50px", marginBottom: "12px"}}/>
                            <h2 style={{color: "green"}}>Payment Successful!</h2>
                            <p>Your order <strong>#{orderId}</strong> has been paid successfully.</p>
                            <p>Thank you for your purchase!</p>
                        </>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default PaymentSuccess;
