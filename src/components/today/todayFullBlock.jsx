import React, { useEffect, useState } from 'react';

import AutoWeather from './autoWeather';
import ViewToday from './viewToday';
import { fetchTodayInfo } from "./todayHelpers";
import { getCachedToday } from "./todayCache";

import './todayFullBlock.css';
import '../../styles/pages.css';

const TodayFullBlock = () => {

  const [todayReady, setTodayReady] = useState(false);
  // Start with the tag cached earlier today so the title doesn't change
  // once the preferences come back.
  const [todayTag, setTodayTag] = useState(
    () => getCachedToday()?.todayTag ?? null
  );

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


export default TodayFullBlock;
