import React from 'react';
import '../css/Footer.css';

function Footer() {

    return (
        <div className="footer-container">
            <div className="footer-left">
                <img src="/icons/copyright.png" alt="Copyright" className="icon" />
                <h2 className="footer-title">2025&nbsp;&nbsp;&nbsp;best reads</h2>
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
