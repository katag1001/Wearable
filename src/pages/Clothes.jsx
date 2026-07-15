import React from 'react';
import Header from '../components/header';
import ViewClothes from '../components/clothes/viewClothes';
import { Link } from 'react-router-dom';
import './pages.css';

const Clothes = ({ loggedIn, logout }) => {
  return (
    <>
  <div className="full-page-container">
   <Header loggedIn={loggedIn} title="My Clothes" />
    <ViewClothes />
</div>
</>

  );
};

export default Clothes;



