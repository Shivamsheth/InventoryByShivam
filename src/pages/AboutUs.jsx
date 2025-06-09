
import React from 'react';
import '../styles/styles.css';

export default function AboutUs() {
  return (
    <div className="container page-wrapper text-light py-5">
      <h2 className="mb-4 fw-bold">About Me</h2>

      <div className="about-card p-4 rounded bg-dark shadow">
        <p className="fs-5 mb-2">
          <strong>Name:</strong> Shivam Sheth
        </p>
        <p className="fs-5 mb-2">
          <strong>Institution:</strong> Parul University, Vadodara
        </p>
        <p className="fs-5 mb-2">
          <strong>Education:</strong> MCA – Full Stack Web Development
        </p>

        <p className="fs-5 mb-2">
          <strong>GitHub Profile:</strong>{' '}
          <a
            href="https://github.com/Shivamsheth"
            target="_blank"
            rel="noopener noreferrer"
            className="text-decoration-none text-info fw-semibold"
          >
            🌐 Explore My Projects
          </a>
        </p>

        <p className="fs-6 text-muted mt-3">
          I'm a passionate developer dedicated to building modern, scalable, and user-focused web applications. This inventory system was created as part of my learning journey and is designed to empower businesses with smart inventory management tools.
        </p>
      </div>
    </div>
  );
}