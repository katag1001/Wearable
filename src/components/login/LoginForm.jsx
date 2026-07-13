// src/components/LoginForm.jsx
import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { URL } from "../../config";
import "./loginForm.css";

const LoginForm = ({ login }) => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
  

    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(`${URL}/users/login`, form);

      setMessage(res.data.message);

      if (res.data.ok && res.data.token) {

        // ✅ ONLY STORE TOKEN (secure baseline improvement)
        localStorage.setItem("token", res.data.token);

        login(res.data.token);
      } else {
        console.log("⚠️ Login failed - no token returned");
      }
    } catch (error) {

      setMessage(error.response?.data?.message || "Login failed");
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

        <button type="submit">Login</button>

        <Link className="register-button" to="/register">
          Register
        </Link>
      </form>
    </div>
  );
};

export default LoginForm;