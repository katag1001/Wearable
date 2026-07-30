import React, { useEffect, useState } from "react";
import axios from "axios";
import "./viewToday.css";
import { URL } from "../../config";
import todayOutfitSort from "./todayOutfitSort";
import MessagePopup from "../general/messagePopup.jsx";


const ViewToday = () => {
  const [outfits, setOutfits] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [loading, setLoading] = useState(true);
  const [checkingToday, setCheckingToday] = useState(false);
  const [message, setMessage] = useState(null);

  const getToken = () => localStorage.getItem("token");

  const fetchTodayOutfits = async (attempt = 0) => {

    try {
      const token = getToken();

      const response = await axios.get(`${URL}/today/get`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });


      const data = response.data;


      // Today is still being created
      if (!Array.isArray(data) || data.length === 0) {

        if (attempt < 10) {
          setCheckingToday(true);

          setTimeout(() => {
            fetchTodayOutfits(attempt + 1);
          }, 1000);

          return;
        }


        setCheckingToday(false);
        setMessage("No outfits saved for today.");
        setLoading(false);

        return;
      }


      // Today outfits are ready
      setOutfits(todayOutfitSort(data));
      setCurrentIndex(0);

      setCheckingToday(false);
      setLoading(false);


    } catch (err) {

      console.error("Failed to fetch today's outfits:", err);

      setCheckingToday(false);
      setLoading(false);
      setMessage("Error fetching outfits: " + err.message);
    }
  };

  const [popup, setPopup] = useState({
      open: false,
      title: "",
      message: "",
    });

  useEffect(() => {
    fetchTodayOutfits();
  }, []);

  const goNext = () => {
    if (outfits.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % outfits.length);
    }
  };

  const goPrev = () => {
    if (outfits.length > 0) {
      setCurrentIndex(
        (prev) => (prev - 1 + outfits.length) % outfits.length
      );
    }
  };

  const markAsWornToday = async () => {
      const outfit = outfits[currentIndex];

      const matchId = outfit.matchId?._id;

      if (!matchId) return;


      try {
        const token = getToken();

        const response = await fetch(`${URL}/match/${matchId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            lastWornDate: new Date().toISOString(),
          }),
        });


        if (response.ok) {
          const updated = await response.json();


          setOutfits((prev) => {
            const arr = [...prev];

            arr[currentIndex] = {
              ...arr[currentIndex],
              lastWornDate: updated.lastWornDate,
            };

            return arr;
          });


          setPopup({
            open: true,
            title: "Success",
            message: "Marked as worn today!",
          });
        }


      } catch (err) {

        setPopup({
          open: true,
          title: "Error",
          message: "Error updating lastWornDate: " + err.message,
        });

      }
    };

  const renderItemImage = (item) => {
    if (!item?.imageUrl) return null;

    return (
      <img
        key={item._id}
        src={item.imageUrl}
        alt={item.name}
        className="today-image"
      />
    );
  };

  // Waiting for today's outfits to be generated
  if (loading || checkingToday) {
    return (
      <p className="today-message">
        Preparing today's outfits...
      </p>
    );
  }

  // Finished checking and nothing exists
  if (message) {
    return (
      <p className="today-message">
        {message}
      </p>
    );
  }

  if (!outfits.length) {
    return (
      <p className="today-message">
        No outfits saved for today.
      </p>
    );
  }

  const outfit = outfits[currentIndex];

  const images = (outfit.matchId?.clothes || [])
    .map((item) => renderItemImage(item))
    .filter(Boolean);

  return (
    <div className="view-today-container">

      <div className="horizontal-scroll-wrapper">

        <button className="left-right" onClick={goPrev}>
          ‹
        </button>


        <div className="clothing-card">

          <div className="today-image-group">
            {images}
          </div>


          <div className="today-buttons">

            <button
              className="regular-button"
              onClick={markAsWornToday}
            >
              Mark as Worn Today
            </button>

          </div>

        </div>


        <button className="left-right" onClick={goNext}>
          ›
        </button>

        

      </div>

      <MessagePopup
        isOpen={popup.open}
        title={popup.title}
        message={popup.message}
        onClose={() =>
          setPopup({
            open: false,
            title: "",
            message: "",
          })
        }
      />


    </div>
  );
};


export default ViewToday;
