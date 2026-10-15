import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { register } from '@core/api/auth.js';
import { getErrorMessage } from '@core/api/errors.js';

const RegisterForm = () => {
  const [form, setForm] = useState({
    email: '',
    password: '',
    password2: '',
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = await register(form);

      setMessage(data.message);

      if (data.ok) {
        setForm({
          email: '',
          password: '',
          password2: '',
        });
      }
    } catch (error) {
      console.error('❌ Registration error:', error);

      // Show the message returned by the backend
      setMessage(getErrorMessage(error, 'Registration failed'));
    }
  };

  return (
    <div className="login-form-container">
      {message && <p>{message}</p>}

      <form onSubmit={handleSubmit}>
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <br />

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <br />

        <input
          name="password2"
          type="password"
          placeholder="Confirm Password"
          value={form.password2}
          onChange={handleChange}
          required
        />
        <br />

        <button type="submit">Register</button>

        <Link className="register-button" to="/login">
          Login
        </Link>
      </form>
    </div>
  );
};

export default RegisterForm;
