// d12_fetching_states / ex1 - reference solution.
import { useEffect, useState } from "react";

export type Weather = { tempC: number; summary: string };

export function WeatherCard({
  city,
  fetchWeather,
}: {
  city: string;
  fetchWeather: (city: string) => Promise<Weather>;
}) {
  const [weather, setWeather] = useState<Weather | null>(null);

  useEffect(() => {
    setWeather(null);
    fetchWeather(city).then(setWeather);
  }, [city, fetchWeather]);

  if (weather === null) {
    return <p role="status">Loading weather for {city}</p>;
  }

  return (
    <p>
      {weather.tempC}C, {weather.summary}
    </p>
  );
}
