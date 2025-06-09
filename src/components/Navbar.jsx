import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4 navbar-toggler">
      <Link className="navbar-brand fw-bold" to="/">
        Inventory App
      </Link>
      <div className="collapse navbar-collapse justify-content-end">
        <ul className="navbar-nav">
          <li className="nav-item">
            <Link to="/" className="nav-link">
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/about" className="nav-link">
              About Us
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/contact" className="nav-link">
              Contact Us
            </Link>
          </li>
          {!isLoggedIn && (
            <>
              <li className="nav-item">
                <Link to="/login" className="nav-link">
                  Login
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/register" className="nav-link">
                  Register
                </Link>
              </li>
            </>
          )}
          {isLoggedIn && (
            <li className="nav-item">
              <span className="nav-link" onClick={handleLogout} style={{ cursor: 'pointer' }}>
                Logout
              </span>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}
