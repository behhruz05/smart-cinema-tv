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
  const monthsRaw = i18n.t('time.months_short', { returnObjects: true }) as unknown;
  const weekDaysRaw = i18n.t('time.weekdays_short', { returnObjects: true }) as unknown;
  const months = Array.isArray(monthsRaw)
    ? (monthsRaw as string[])
    : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const weekDays = Array.isArray(weekDaysRaw)
    ? (weekDaysRaw as string[])
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const pad = (n: number) => String(n).padStart(2, '0');

  const weekDayIndex = date.getDay();
  const monthIndex = date.getMonth();

  const weekDay = weekDays[weekDayIndex] ?? weekDays[0];
  const day = date.getDate();
  const month = months[monthIndex] ?? months[0];
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
