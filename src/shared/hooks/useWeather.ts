import { useEffect, useState } from 'react';

type WeatherData = {
  temp: string;
  icon: string;
};

function getWeatherIcon(code: number, isDay: number) {
  if (code === 0) return isDay ? '☀️' : '🌙';
  if ([1, 2].includes(code)) return isDay ? '🌤' : '🌥';
  if (code === 3) return '☁️';
  if ([45, 48].includes(code)) return '🌫';
  if ([51, 53, 55].includes(code)) return '🌦';
  if ([61, 63, 65].includes(code)) return '🌧';
  if ([71, 73, 75].includes(code)) return '❄️';
  if ([95, 96, 99].includes(code)) return '⛈';
  return '🌡';
}

export function useWeather(): WeatherData {
  const [weather, setWeather] = useState<WeatherData>({
    temp: '',
    icon: '',
  });

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch(
          'https://api.open-meteo.com/v1/forecast?latitude=41.2995&longitude=69.2401&current_weather=true'
        );
        const data = await res.json();

        if (data?.current_weather) {
          const temp = Math.round(data.current_weather.temperature);
          const code = data.current_weather.weathercode;
          const isDay = data.current_weather.is_day;

          setWeather({
            temp: `${temp}°`,
            icon: getWeatherIcon(code, isDay),
          });
        }
      } catch {
        setWeather({ temp: '', icon: '' });
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 600000);
    return () => clearInterval(interval);
  }, []);

  return weather;
}
