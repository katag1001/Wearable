// src/components/RegisterForm.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {URL} from "../config"; 

const RegisterForm = () => {
  const [form, setForm] = useState({
    email: '',
    password: '',
    password2: '',
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(`${URL}/users/register`, form);
      setMessage(res.data.message);

      if (res.data.ok) {
        setForm({ email: '', password: '', password2: '' });
      }
    } catch (error) {
      console.error('❌ Registration error:', error);
      setMessage('Registration failed');
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
        /><br/>
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        /><br/>
        <input
          name="password2"
          type="password"
          placeholder="Confirm Password"
          value={form.password2}
          onChange={handleChange}
          required
        /><br/>
        <button type="submit">Register</button>
        <Link className="register-button" to="/login">Login</Link>
      </form>
      
    </div>
  );
};

export default RegisterForm;
