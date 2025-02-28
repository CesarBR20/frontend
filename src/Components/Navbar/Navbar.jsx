import React from "react";
import "./Navbar.css";
import logoImage from "../../assets/logo.jpg";

const Navbar = ({ isAuthenticated, onLogout }) => {
    return (
        <header className="header">
            <a href="" className="logo">
                <img src={logoImage} alt="logo" />
            </a>

            <nav className="navbar">
                <a href="https://basterisreyes.com/#quienes-somos" target="_blank" rel="noopener noreferrer">About</a>
                {isAuthenticated && (
                    <a href="#" onClick={onLogout}>Logout</a> // Enlace de logout
                )}
            </nav>
        </header>
    );
};

export default Navbar;
