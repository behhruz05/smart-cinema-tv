import i18n from '../../i18n';

export const formatDurationHM = (seconds: number): string => {
  if (!seconds) return i18n.t('time.duration_zero');

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return i18n.t('time.duration_hours_minutes', {
      hours,
      minutes,
    });
  }

  return i18n.t('time.duration_minutes', { minutes });
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

export const formatCurrentHeaderDateTime = (): string => {
  const date = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const months = i18n.t('time.months_short', {
    returnObjects: true,
  }) as string[];
  const weekDays = i18n.t('time.weekdays_short', {
    returnObjects: true,
  }) as string[];

  const weekDay = weekDays[date.getDay()];
  const day = date.getDate();
  const month = months[date.getMonth()];
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
