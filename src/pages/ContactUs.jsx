// ContactUs.jsx
import React from 'react';
import '../styles/styles.css';

export default function ContactUs() {
  return (
    <div className="container page-wrapper text-light py-5">
      <h2 className="mb-4 fw-bold">Contact Us</h2>

      <div className="about-card p-4 rounded bg-dark shadow">
        <p className="fs-5 mb-2">
          We'd love to hear from you! Feel free to reach out for feedback, collaboration, or support.
        </p>
        <p className="fs-5 mb-2">
          <strong>Developer Email:</strong>{' '}
          <a href="mailto:shivamsheth808@gmail.com" className="text-decoration-none text-info fw-semibold">
            📧 shivamsheth808@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
}
