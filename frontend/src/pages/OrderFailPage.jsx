import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../css/PaymentSuccess.css";

const OrderFailPage = () => {
    const { orderId } = useParams();

    return (
        <>
            <Navbar />
            <div className="payment-success-container">
                <div className="payment-success-box">
                    <img src="/icons/failure.png" style={{height: "50px", width: "50px", marginBottom: "8px"}}/>
                    <h2 className="error">Order Failed or Canceled</h2>
                    <p>Your payment for Order #{orderId} could not be completed.</p>
                    <p>Please try again.</p>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default OrderFailPage;
