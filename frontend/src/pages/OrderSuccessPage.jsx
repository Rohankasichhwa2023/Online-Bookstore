import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../css/PaymentSuccess.css";

const OrderSuccessPage = () => {
    const { orderId } = useParams();

    return (
        <>
            <Navbar />
            <div className="payment-success-container">
                <div className="payment-success-box">
                    <img src="/icons/success.png" style={{height: "50px", width: "50px", marginBottom: "12px"}}/>
                    <h2 style={{color: "green"}}>Payment Successful!</h2>
                    <p>Your order <strong>#{orderId}</strong> has been paid successfully.</p>
                    <p>Thank you for your purchase!</p>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default OrderSuccessPage;
