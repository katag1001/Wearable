import React, { useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom';
import Header from '../components/header';
import RegisterForm from '../components/login/registerForm';
import './pages.css';

const Register = ({ loggedIn, logout }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (loggedIn) {
      navigate('/'); 
    }
  }, [loggedIn, navigate]);

  return (
    <div className="full-page-container">
      <Header loggedIn={loggedIn} />
        <h2 className="page-title">Register</h2>
        <RegisterForm />
    </div>

  );
};

export default Register;
