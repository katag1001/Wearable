// src/components/LoginForm.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {URL} from "../config"; 
import './loginForm.css'

const LoginForm = ({ login }) => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🔍 Submitting login form with:', form);

    try {
      const res = await axios.post(`${URL}/users/login`, form);
      console.log('✅ Login response from backend:', res.data);

      setMessage(res.data.message);

      if (res.data.ok && res.data.token) {

        console.log('✅ Token received:', res.data.token);
        login(res.data.token, res.data.email); 
      } else {
        console.log('⚠️ Login unsuccessful, no token received');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      setMessage('Login failed');
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
        <button type="submit">Login</button>
        <Link className="register-button" to="/register">Register</Link>
      </form>
      
    </div>
  );
};

export default LoginForm;
