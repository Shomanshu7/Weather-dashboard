import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";

const API_KEY = "adf42d88bd7b405b0627d136fab6c01c";

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [searchHistory, setSearchHistory] = useState([]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    const storedHistory = JSON.parse(localStorage.getItem("weatherHistory")) || [];
    setSearchHistory(storedHistory);

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        fetchWeatherByCoords(latitude, longitude);
      });
    }
  }, []);

  const updateHistory = (cityName) => {
    const updated = [cityName, ...searchHistory.filter(c => c !== cityName)].slice(0, 5);
    setSearchHistory(updated);
    localStorage.setItem("weatherHistory", JSON.stringify(updated));
  };

  const fetchWeather = async (customCity) => {
    const query = customCity || city;
    if (!query.trim()) return;
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${query}&appid=${API_KEY}&units=metric`
      );
      const data = await response.json();
      if (data.cod !== 200) {
        setError(data.message || "City not found.");
        setWeather(null);
        setForecast([]);
      } else {
        setWeather(data);
        updateHistory(data.name);
        const forecastRes = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?q=${query}&appid=${API_KEY}&units=metric`
        );
        const forecastData = await forecastRes.json();
        setForecast(filterForecast(forecastData.list));
        setError("");
      }
    } catch {
      setError("Something went wrong.");
      setWeather(null);
      setForecast([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherByCoords = async (lat, lon) => {
    setLoading(true);
    try {
      const current = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );
      const currentData = await current.json();
      setWeather(currentData);
      updateHistory(currentData.name);

      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );
      const forecastData = await forecastRes.json();
      setForecast(filterForecast(forecastData.list));
      setError("");
    } catch {
      setError("Failed to fetch location-based weather.");
    } finally {
      setLoading(false);
    }
  };

  const filterForecast = (list) =>
    list.filter((item) => item.dt_txt.includes("12:00:00")).slice(0, 5);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") fetchWeather();
  };

  const getClothingAdvice = (temp) => {
    if (temp < 10) return "🧥 It's cold, wear a heavy jacket.";
    if (temp < 20) return "🧢 Light jacket or sweater should be fine.";
    if (temp < 30) return "👕 T-shirt weather!";
    return "🌞 It's hot — wear light clothes and stay hydrated!";
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode
          ? "bg-gradient-to-tr from-indigo-900 via-purple-800 to-pink-600 text-white"
          : "bg-gradient-to-br from-yellow-100 via-blue-100 to-white text-gray-900"
      } flex flex-col items-center justify-start p-4`}
    >
      {/* Toggle Switch */}
      <div className="absolute top-4 right-6">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="text-sm px-3 py-1 bg-white/80 dark:bg-black/30 rounded-xl shadow font-semibold"
        >
          {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>

      <motion.h1
        className="text-5xl font-extrabold mt-12 mb-6 text-center"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        🌤️ Smart Weather App
      </motion.h1>

      {/* Search Input */}
      <motion.div
        className="flex w-full max-w-md gap-2 mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter city..."
          className="flex-grow px-4 py-3 rounded-xl text-black shadow-md focus:outline-none"
        />
        <button
          onClick={() => fetchWeather()}
          className="bg-white text-purple-700 font-semibold px-5 py-3 rounded-xl hover:bg-purple-100 shadow-md"
        >
          Search
        </button>
      </motion.div>

      {/* History */}
      {searchHistory.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {searchHistory.map((item, index) => (
            <button
              key={index}
              onClick={() => fetchWeather(item)}
              className="text-sm bg-white/70 dark:bg-white/20 px-4 py-2 rounded-full shadow hover:scale-105 transition"
            >
              {item}
            </button>
          ))}
        </div>
      )}

      {error && (
        <motion.div
          className="text-red-500 font-semibold mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {error}
        </motion.div>
      )}

      {loading && (
        <motion.div
          className="text-lg font-bold mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          🔄 Loading...
        </motion.div>
      )}

      {!loading && weather && weather.main && (
        <motion.div
          className="backdrop-blur-md bg-white/10 dark:bg-white/20 border border-white/30 p-6 rounded-2xl w-full max-w-md text-center shadow-xl mt-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold mb-1">{weather.name}</h2>
          <img
            className="mx-auto w-20 h-20"
            src={`http://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
            alt={weather.weather[0].description}
          />
          <p className="text-xl font-medium capitalize mb-2">
            {weather.main.temp}°C – {weather.weather[0].description}
          </p>
          <p>💧 Humidity: {weather.main.humidity}%</p>
          <p>💨 Wind: {weather.wind.speed} m/s</p>
          <p>🌡️ Feels like: {weather.main.feels_like}°C</p>
          <p className="mt-3 italic font-semibold text-yellow-700 dark:text-yellow-200">
            {getClothingAdvice(weather.main.temp)}
          </p>
        </motion.div>
      )}

      {forecast.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mt-8 max-w-5xl">
          {forecast.map((item, index) => (
            <motion.div
              key={index}
              className="bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 p-4 rounded-xl text-center shadow-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
            >
              <h3 className="text-lg font-semibold mb-2">
                {format(new Date(item.dt_txt), "EEE")}
              </h3>
              <img
                className="mx-auto w-14 h-14"
                src={`http://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`}
                alt={item.weather[0].description}
              />
              <p className="capitalize">{item.weather[0].description}</p>
              <p className="text-lg mt-1">{item.main.temp}°C</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
