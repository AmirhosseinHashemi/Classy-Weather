import { useEffect, useState } from "react";
import { formatDay, convertToFlag, getWeatherIcon } from "./helper";

// Components

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState("");
  const [displayLocation, setDisplayLocation] = useState("");
  const [weather, setWeather] = useState({});

  useEffect(
    function () {
      const controller = new AbortController();

      async function fetchWeather() {
        if (location.length < 2) return setWeather({});
        setIsLoading(true);

        try {
          // 1) Getting location (geocoding)
          const geoRes = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${location}`,
            { signal: controller.signal }
          );
          const geoData = await geoRes.json();
          if (!geoData.results) throw new Error("Location not found");

          const { latitude, longitude, timezone, name, country_code } =
            geoData.results.at(0);
          setDisplayLocation(`${name} ${convertToFlag(country_code)}`);

          // 2) Getting actual weather
          const weatherRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&timezone=${timezone}&daily=weathercode,temperature_2m_max,temperature_2m_min`
          );
          const weatherData = await weatherRes.json();
          setWeather(weatherData.daily);
        } catch (err) {
          if (err.name !== "AbortError") {
            console.error(err.message);
          }
        } finally {
          setIsLoading(false);
        }
      }
      fetchWeather();

      return function () {
        controller.abort();
      };
    },
    [location]
  );

  return (
    <div className="app">
      <h1>Classy Weather</h1>
      <Input location={location} onSetLocation={setLocation} />
      {isLoading && <p className="loader">Loading ...</p>}

      {weather.weathercode && (
        <Weather weather={weather} loc={displayLocation} />
      )}
    </div>
  );
}

function Input({ location, onSetLocation }) {
  return (
    <div>
      <input
        type="text"
        value={location}
        onChange={(e) => onSetLocation(e.target.value)}
      ></input>
    </div>
  );
}

function Weather({ weather, loc }) {
  const {
    temperature_2m_max: max,
    temperature_2m_min: min,
    time: dates,
    weathercode: codes,
  } = weather;

  return (
    <div>
      <h2>Weather {loc}</h2>

      <ul className="weather">
        {dates.map((date, i) => (
          <Day
            date={date}
            min={min.at(i)}
            max={max.at(i)}
            code={codes.at(i)}
            isToday={i === 0}
            key={date}
          />
        ))}
      </ul>
    </div>
  );
}

function Day({ date, min, max, code, isToday }) {
  return (
    <li className="day">
      <span>{getWeatherIcon(code)}</span>
      <p>{isToday ? "Today" : formatDay(date)}</p>
      <p>
        {Math.floor(min)}&deg; &mdash; {Math.ceil(max)}&deg;
      </p>
    </li>
  );
}

export default App;
