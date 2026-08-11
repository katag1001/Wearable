import React, { useEffect, useState } from 'react';

import AutoWeather from './autoWeather';
import ViewToday from './viewToday';
import { fetchTodayInfo } from "./todayHelpers";

import './todayBlock.css';


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

      <h1 className="today-title">
        Today's Outfit{' '}
        {todayTag
          ? `— ${todayTag.charAt(0).toUpperCase()}${todayTag.slice(1)}`
          : ''}
      </h1>

      <AutoWeather
        setTodayReady={setTodayReady}
      />

      <ViewToday
        todayReady={todayReady}
      />

    </div>
  );
};


export default TodayBlock;
