import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase'; // Ensure your firebase.js exports both
import { useNavigate } from 'react-router-dom';
import '../styles/styles.css';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    business: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    try {
      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
      const user = userCredential.user;

      // Store additional user details in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: form.email,
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        business: form.business,
        createdAt: new Date().toISOString()
      });

      navigate('/login');
    } catch (err) {
      console.error(err);
      setError('Registration failed. Please check your inputs or try a different email.');
    }
  };

  return (
    <div className="page-container">
      <h1 className="display-4 fw-bold mb-3 gradient-text">
        Welcome to <span className="text-primary">Pro-Inventory</span>
      </h1>

      <div className="auth-card">
        <h2 className="mb-4 text-center">Register</h2>

        {error && <div className="alert alert-danger mb-3">{error}</div>}

        <input
          type={showPassword ? 'text' : 'password'}
          className="form-control"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <div className="form-check my-2">
          <input
            className="form-check-input"
            type="checkbox"
            id="showPass"
            onChange={() => setShowPassword(!showPassword)}
          />
          <label className="form-check-label" htmlFor="showPass">
            Show Password
          </label>
        </div>

        <input
          type="text"
          className="form-control"
          placeholder="First Name"
          value={form.firstName}
          onChange={(e) => setForm({ ...form, firstName: e.target.value })}
        />

        <input
          type="text"
          className="form-control"
          placeholder="Last Name"
          value={form.lastName}
          onChange={(e) => setForm({ ...form, lastName: e.target.value })}
        />

        <input
          type="tel"
          className="form-control"
          placeholder="Phone Number"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />

        <input
          type="email"
          className="form-control"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          type="text"
          className="form-control"
          placeholder="Business Details"
          value={form.business}
          onChange={(e) => setForm({ ...form, business: e.target.value })}
        />

        <button className="btn btn-gradient w-100 mt-3" onClick={handleRegister}>
          Register
        </button>
      </div>
    </div>
  );
}
