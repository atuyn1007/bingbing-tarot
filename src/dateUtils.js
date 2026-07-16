export function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDisplaySignInDate(date = new Date()) {
  return getLocalDateKey(date);
}

export function getMonthCalendarDays(date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const leadingBlankDays = (firstDay.getDay() + 6) % 7;
  const days = Array.from({ length: leadingBlankDays }, (_, index) => ({
    type: 'blank',
    key: `blank-${year}-${month}-${index}`,
  }));

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    const currentDate = new Date(year, month, day);
    const dateKey = getLocalDateKey(currentDate);
    days.push({ type: 'day', key: dateKey, day, dateKey });
  }

  return days;
}

export function getCalendarDayState(dateKey, dailyHistory = {}, today = new Date()) {
  if (dailyHistory?.[dateKey]) return 'completed';

  const todayKey = getLocalDateKey(today);
  if (dateKey === todayKey) return 'today-empty';

  return dateKey > todayKey ? 'future' : 'missed';
}

export function isSameCalendarMonth(left, right) {
  return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth();
}
