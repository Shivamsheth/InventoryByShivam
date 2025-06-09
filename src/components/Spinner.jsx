// src/components/Spinner.jsx

import React from 'react';

export default function Spinner() {
  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-dark text-white">
      <div className="spinner-border text-light" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
}
