import React from "react";
import { formatDay, getWeatherIcon, convertToFlag } from "./helper";

class App extends React.Component {
  state = {
    location: "",
    displayLocation: "",
    weather: {},
    isLoading: false,
  };

  fetchWeather = async () => {
    if (this.state.location.length < 2) return this.setState({ weather: {} });

    this.setState({ isLoading: true });

    try {
      // 1) Getting location (geocoding)
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${this.state.location}`
      );
      const geoData = await geoRes.json();

      if (!geoData.results) throw new Error("Location not found");

      const { latitude, longitude, timezone, name, country_code } =
        geoData.results.at(0);

      this.setState({
        displayLocation: `${name} ${convertToFlag(country_code)}`,
      });

      // 2) Getting actual weather
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&timezone=${timezone}&daily=weathercode,temperature_2m_max,temperature_2m_min`
      );
      const weatherData = await weatherRes.json();

      this.setState({ weather: weatherData.daily });
    } catch (err) {
      console.error(err.message);
    } finally {
      this.setState({ isLoading: false });
    }
  };

  setLocation = (e) => {
    this.setState({ location: e.target.value });
  };

  componentDidMount() {
    this.setState({ location: localStorage.getItem("location") || "" });
  }

  componentDidUpdate(preProps, preState) {
    if (this.state.location !== preState.location) {
      this.fetchWeather();

      localStorage.setItem("location", this.state.location);
    }
  }

  render() {
    return (
      <div className="app">
        <h1>Classy Weather</h1>
        <Input
          location={this.state.location}
          onSetLocation={this.setLocation}
        />
        {this.state.isLoading && <p className="loader">Loading ...</p>}

        {this.state.weather.weathercode && (
          <Weather
            weather={this.state.weather}
            loc={this.state.displayLocation}
          />
        )}
      </div>
    );
  }
}

class Input extends React.Component {
  render() {
    return (
      <div>
        <input
          type="text"
          value={this.props.location}
          onChange={this.props.onSetLocation}
        ></input>
      </div>
    );
  }
}

class Weather extends React.Component {
  render() {
    const {
      temperature_2m_max: max,
      temperature_2m_min: min,
      time: dates,
      weathercode: codes,
    } = this.props.weather;

    return (
      <div>
        <h2>Weather {this.props.loc}</h2>

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
}

class Day extends React.Component {
  render() {
    const { min, max, date, code, isToday } = this.props;

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
}

export default App;
