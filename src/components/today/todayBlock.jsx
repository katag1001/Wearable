import React, { useEffect, useState } from 'react';

import AutoWeather from './autoWeather';
import ViewToday from './viewToday';
import { fetchTodayInfo } from "./todayHelpers";

import './todayBlock.css';
import '../../styles/pages.css';

const TodayBlock = () => {

  const [todayReady, setTodayReady] = useState(false);
  const [todayTag, setTodayTag] = useState(null);

  useEffect(() => {
    const loadTodayInfo = async () => {
      const { todayTag } = await fetchTodayInfo();
      setTodayTag(todayTag);
    };

    loadTodayInfo();
  }, []);

  return (
    <div className="today-block">

      <div className="today-top">

        <h1 className="page-title">
          Today's {' '}
          {todayTag
            ? `${todayTag.charAt(0).toUpperCase()}${todayTag.slice(1)}`
            : ''} Outfit
        </h1>

        <AutoWeather
          setTodayReady={setTodayReady}
        />

      </div>

      <ViewToday
        todayReady={todayReady}
      />

    </div>
  );
};


export default TodayBlock;
