import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/styles.css';

export default function Login() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ username: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async () => {
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', form);
            localStorage.setItem('token', res.data.token);
            navigate('/inventory');
        } catch (err) {
            setError('Invalid username or password');
        }
    };

    return (
        
            <div className="page-container">
                  <h1 className="display-4 fw-bold mb-3 gradient-text">Welcome to <span className="text-primary">Pro-Inventory</span></h1>

            <div className="auth-card" >
                <h2 className="mb-4 text-center">Login</h2>

                {error && (
                    <div className="alert alert-danger mb-3">{error}</div>
                )}

                <input
                    type="text"
                    className="form-control"
                    placeholder="Username"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
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
