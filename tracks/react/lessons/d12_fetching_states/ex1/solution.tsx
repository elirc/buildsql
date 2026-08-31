// d12_fetching_states / ex1 - loading is a state, not a gap.
// See tracks/react/lessons/d12_fetching_states/README.md, "Exercise 1".
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
    fetchWeather(city).then(setWeather);
  }, [city, fetchWeather]);

  return <p>{weather === null ? "..." : `${weather.tempC}C, ${weather.summary}`}</p>;
}
