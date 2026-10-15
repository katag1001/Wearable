// src/components/LoginForm.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { getErrorMessage } from "@core/api/errors.js";
import "./loginForm.css";

// `login` comes from useAuthSession (core/hooks/useAuthSession.js), which
// saves the token and email and checks the style quiz.
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
      await login(form.email, form.password);
    } catch (error) {

      setMessage(getErrorMessage(error, "Login failed"));
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
