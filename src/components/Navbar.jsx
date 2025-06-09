import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import '../styles/styles.css';

export default function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  return (
    <nav
      className="navbar navbar-expand-lg navbar-dark bg-dark shadow-lg px-4 py-2 position-fixed top-0 w-100 elegant-navbar"
      style={{
        zIndex: 1050,
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold text-glow" to="/">
          🚀 Inventory App
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse justify-content-center" id="navbarNav">
          <ul className="navbar-nav gap-3 text-center">
            <li className="nav-item">
              <Link to="/" className="nav-link nav-link-hover">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/about" className="nav-link nav-link-hover">
                About Us
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/contact" className="nav-link nav-link-hover">
                Contact Us
              </Link>
            </li>
            {!user ? (
              <>
                <li className="nav-item">
                  <Link to="/login" className="nav-link nav-link-hover">
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/register" className="nav-link nav-link-hover">
                    Register
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link to="/profile" className="nav-link nav-link-hover">
                    Profile
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/inventory" className="nav-link nav-link-hover">
                    Inventory
                  </Link>
                </li>
                <li className="nav-item">
                  <span
                    className="nav-link nav-link-hover"
                    onClick={handleLogout}
                    style={{ cursor: 'pointer' }}
                  >
                    Logout
                  </span>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
