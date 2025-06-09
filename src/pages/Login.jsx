import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase'; // Make sure this path is correct
import { useNavigate } from 'react-router-dom';
import '../styles/styles.css';

export default function Login() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async () => {
        try {
            await signInWithEmailAndPassword(auth, form.email, form.password);
            navigate('/inventory');
        } catch (err) {
            setError('Invalid email or password');
        }
    };

    return (
        <div className="page-container">
            <h1 className="display-4 fw-bold mb-3 gradient-text">
                Welcome to <span className="text-primary">Pro-Inventory</span>
            </h1>

            <div className="auth-card">
                <h2 className="mb-4 text-center">Login</h2>

                {error && (
                    <div className="alert alert-danger mb-3">{error}</div>
                )}

                <input
                    type="email"
                    className="form-control"
                    placeholder="Email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                />

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

                <button className="btn btn-gradient w-100 mt-3" onClick={handleLogin}>
                    Login
                </button>
            </div>
        </div>
    );
}
