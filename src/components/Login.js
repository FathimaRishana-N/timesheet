import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();

        axios.post('http://localhost:5000/login', { username, password })
            .then((res) => {
                console.log('Login response data:', res.data);

                if (res.data) {
                    const { role, employeeId, projects } = res.data;

                    localStorage.setItem('employeeId', employeeId);

                    if (role === 'admin') {
                        navigate('/admin-dashboard');
                    } else if (role === 'employee') {
                        navigate('/TimesheetTable', {
                            state: { employeeId, projects },
                        });
                    } else {
                        alert('Unknown role. Contact administrator.');
                    }
                } else {
                    alert('Invalid login! Please try again.');
                }
            })
            .catch((err) => {
                console.error('Login error: ', err);
                alert('Login failed. Username or Password is incorrect!');
            });
    };

    return (
        <div
            className="d-flex justify-content-center align-items-center vh-100"
            style={{ backgroundColor: 'rgb(248, 248, 248)' }}
        >
            <div className="card p-4" style={{ maxWidth: '400px', width: '100%' }}>
                <h2 className="text-center">User Login</h2>
                <form onSubmit={handleLogin}>
                    <div className="mb-3">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <input
                            type="password"
                            className="form-control"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary w-100"
                        style={{ backgroundColor: 'black', borderColor: 'black' }}>
                        Login
                    </button>
                    <p className="text-center mt-3">
                        Not a Member?{' '}
                        <a href="/signup" className="text-primary">
                            Sign up
                        </a>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;
