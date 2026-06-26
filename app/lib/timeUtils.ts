export function getJakartaTime(): Date {
  const now = new Date();
  // Get exactly UTC+7
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  return new Date(utc + (3600000 * 7));
}

export function isFirstDayOfMonth(): boolean {
  const jakartaDate = getJakartaTime();
  return jakartaDate.getDate() === 1;
}

export function getCurrentMonthAndYear() {
  const jakartaDate = getJakartaTime();
  return {
    month: jakartaDate.getMonth() + 1, // JS months are 0-indexed
    year: jakartaDate.getFullYear()
  };
}
