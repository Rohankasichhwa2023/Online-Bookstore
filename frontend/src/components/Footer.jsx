import React from 'react';
import '../css/Footer.css';

function Footer() {

    return (
        <div className="footer-container">
            <div className="footer-left">
                <img src="/icons/copyright.png" alt="Copyright" style={{height: "20px", width: "20px"}} />
                <h2 className="footer-title">2025 <strong><span style={{color: "#0a3b6b"}}>best reads</span></strong></h2>
            </div>

            <div className="footer-right">
                <img src="/icons/fb.png" alt="Facebook" className="icon" />
                <img src="/icons/ig.png" alt="Instagram" className="icon" />
                <img src="/icons/tiktok.png" alt="Tiktok" className="icon" />
            </div>
        </div>
    );
}

export default Footer;
