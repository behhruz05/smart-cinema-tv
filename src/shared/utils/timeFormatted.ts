// src/shared/utils/timeFormatted.ts

// ==============================
// 🎬 DURATION FORMATTERS
// ==============================

export const formatDurationHM = (seconds: number): string => {
  if (!seconds) return '0 мин';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours} ч ${minutes} мин`;
  }

  return `${minutes} мин`;
};

export const formatDurationClock = (seconds: number): string => {
  if (!seconds) return '00:00';

  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const pad = (n: number) => String(n).padStart(2, '0');

  if (hrs > 0) {
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  }

  return `${pad(mins)}:${pad(secs)}`;
};

// ==============================
// 📅 DATE FORMATTERS
// ==============================
const monthsRu = [
  'янв',
  'фев',
  'мар',
  'апр',
  'май',
  'июн',
  'июл',
  'авг',
  'сен',
  'окт',
  'ноя',
  'дек',
];

const weekDaysRu = [
  'Вс',
  'Пн',
  'Вт',
  'Ср',
  'Чт',
  'Пт',
  'Сб',
];

export const formatCurrentHeaderDateTime = (): string => {
  const date = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');

  const weekDay = weekDaysRu[date.getDay()];
  const day = date.getDate();
  const month = monthsRu[date.getMonth()];
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${weekDay}, ${day} ${month}. ${hours}:${minutes}`;
};
export const calculateProgressPercent = (
  current: number,
  total: number
): number => {
  if (!total) return 0;
  return Math.min((current / total) * 100, 100);
};
