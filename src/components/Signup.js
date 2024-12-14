import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const [user, setUser] = useState({
    Name: '',
    username: '',
    email:'',
    password: '',
    department: '',
    role: 'employee',
  });

  const [error, setError] = useState('');
  const navigate = useNavigate();

  const submitUser = (e) => {
    e.preventDefault();
    setError(''); 

    axios.post('http://localhost:5000/user', user)
      .then((res) => {
        console.log(res.data);
        navigate('/'); 
      })
      .catch((err) => {
        if (err.response) {
          if (err.response.status === 409) {
            setError("Invalid! Username isn't available");
            // Clear only the username field
            setUser((prevUser) => ({ ...prevUser, username: '' }));
          } else {
            setError(err.response.data.message || 'An unexpected error occurred. Please try again.');
          }
        } else {
          setError('Unable to connect to the server. Please try again.');
        }
      });
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{ backgroundColor: 'rgb(248, 248, 248)' }}>
      <div className="card p-4" style={{ maxWidth: '400px', width: '100%' }}>
        <form onSubmit={submitUser}>
          <div className="mb-3">
            <label className="form-label">Full Name:</label>
            <input
              type="text"
              name="Name"
              onChange={(e) => setUser({ ...user, Name: e.target.value })}
              className="form-control"
              placeholder="John"
              value={user.Name}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Username:</label>
            <input
              type="text"
              name="username"
              onChange={(e) => setUser({ ...user, username: e.target.value })}
              className="form-control"
              placeholder="John_23"
              value={user.username}
              required
            />
          </div>
            <div className="mb-3">
            <label className="form-label">Email:</label>
            <input
              type="email"
              name="email"
              onChange={(e) => setUser({ ...user, email: e.target.value })}
              className="form-control"
              placeholder="John@3gmai.com"
              value={user.email}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password:</label>
            <input
              type="password"
              name="password"
              onChange={(e) => setUser({ ...user, password: e.target.value })}
              className="form-control"
              placeholder="john340"
              value={user.password}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Department:</label>
            <input
              type="text"
              name="department"
              onChange={(e) => setUser({ ...user, department: e.target.value })}
              className="form-control"
              placeholder="Quality Assurance"
              value={user.department}
              required
            />
          </div>
          {error && <p className="text-danger">{error}</p>}
          <button
            type="submit"
            className="btn btn-primary w-100"
            style={{ backgroundColor: 'black', borderColor: 'black' }}>
            Submit
          </button>
          <p className="text-center mt-3">
            <a href="/" className="text-primary">
              Log in
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
