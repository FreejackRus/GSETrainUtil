export const formatRussianDate = (dateString: string): string => {
  const date = new Date(dateString);

  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();

  const months = [
    "января",
    "февраля",
    "марта",
    "апреля",
    "мая",
    "июня",
    "июля",
    "августа",
    "сентября",
    "октября",
    "ноября",
    "декабря",
  ];

  const month = months[date.getMonth()]; // getMonth возвращает 0-11

  return `«${day}» ${month} ${year} г.`;
};

export const formatRussianDateDocument = (dateString: string): string => {
  const date = new Date(dateString);

  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  if (month > 9) {
    return `${day}.${month}.${year} г.`;
  } else {
    return `${day}.0${month}.${year} г.`;
  }
};
