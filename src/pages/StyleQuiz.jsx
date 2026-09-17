import React from "react";
import Header from "../components/header";
import StyleQuizForm from "../components/styleQuiz/StyleQuizForm";
import "../styles/pages.css";

const StyleQuiz = ({ loggedIn, onComplete }) => {
  return (
    <div className="full-page-container">
      <Header loggedIn={loggedIn} />
      <StyleQuizForm onComplete={onComplete} />
    </div>
  );
};

export default StyleQuiz;
