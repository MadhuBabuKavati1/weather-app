import React, { useState } from 'react';
import './App.css';

function App() {
  const [location, setLocation] = useState('');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [error, setError] = useState(null);

  const fetchWeather = async (coords) => {
    const apiKey = '75b047416f26085b531719a752c2e02b';
    const base = 'https://api.openweathermap.org/data/2.5/forecast';

    const query = coords
      ? `lat=${coords.latitude}&lon=${coords.longitude}`
      : `q=${encodeURIComponent(location)}`;

    const url = `${base}?${query}&appid=${apiKey}&units=metric`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Error fetching weather data');
        setWeather(null);
        setForecast([]);
        document.body.className = 'default';
        return;
      }

      setError(null);

      const current = data.list[0];
      const city = data.city;

      const cToF = (c) => Math.round(c * 9 / 5 + 32);

      const formatTime = (timestamp) => {
        const date = new Date(timestamp * 1000);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      };

      setWeather({
        name: city.name,
        country: city.country,
        tempC: current.main.temp,
        tempF: cToF(current.main.temp),
        condition: current.weather[0].description,
        icon: current.weather[0].icon,
        sunrise: formatTime(city.sunrise),
        sunset: formatTime(city.sunset),
      });

      const conditionMain = current.weather[0].main.toLowerCase();
      let bg = 'default';
      if (conditionMain.includes("clear")) bg = "clear";
      else if (conditionMain.includes("clouds")) bg = "clouds";
      else if (conditionMain.includes("rain")) bg = "rain";
      else if (conditionMain.includes("snow")) bg = "snow";
      document.body.className = '';
      document.body.classList.add(bg);

      const grouped = {};
      data.list.forEach(item => {
        const date = item.dt_txt.split(" ")[0];
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(item);
      });

      const today = new Date().toISOString().split("T")[0];

      const daily = Object.entries(grouped)
        .filter(([date]) => date !== today)
        .slice(0, 5)
        .map(([date, values]) => {
          const mid = values[4] || values[Math.floor(values.length / 2)];
          return {
            date,
            tempC: mid?.main.temp || 'N/A',
            tempF: cToF(mid?.main.temp || 0),
            condition: mid?.weather[0]?.description || 'N/A',
            icon: mid?.weather[0]?.icon || '01d'
          };
        });

      setForecast(daily);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Something went wrong.");
      document.body.className = 'default';
    }
  };

  const useMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather(position.coords);
        },
        (err) => {
          setError("Location access denied.");
        }
      );
    } else {
      setError("Geolocation not supported.");
    }
  };

  return (
    <div className="App">
      <h1>🌤 Weather App</h1>

      <div className="input-group">
        <input
          type="text"
          value={location}
          onChange={e => setLocation(e.target.value)}
          placeholder="Enter a city..."
        />
        <button onClick={() => fetchWeather()}>Get Weather</button>
        <button onClick={useMyLocation}>📍 Use My Location</button>
      </div>

      {error && <p className="error">❌ {error}</p>}

      {weather && (
        <div className="weather-card">
          <h2>{weather.name}, {weather.country}</h2>
          <img
            src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
            alt={weather.condition}
          />
          <p>{weather.condition}</p>
          <p>🌡 {weather.tempC}°C / {weather.tempF}°F</p>
          <p>🌅 Sunrise: {weather.sunrise} | 🌇 Sunset: {weather.sunset}</p>
        </div>
      )}

      {forecast.length > 0 && (
        <div className="forecast-container">
          <h3>5-Day Forecast</h3>
          <div className="forecast-grid">
            {forecast.map(day => (
              <div className="forecast-card" key={day.date}>
                <h4>{day.date}</h4>
                <img
                  src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`}
                  alt={day.condition}
                />
                <p>{day.condition}</p>
                <p>🌡 {day.tempC}°C / {day.tempF}°F</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
