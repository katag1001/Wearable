// src/components/StyleQuizGate.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

const StyleQuizGate = ({ loggedIn, needsStyleQuiz, children }) => {
  if (loggedIn && needsStyleQuiz) {
    return <Navigate to="/style-quiz" replace />;
  }

  return children;
};

export default StyleQuizGate;
