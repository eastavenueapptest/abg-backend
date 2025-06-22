const getDateFormat = (dateString) => {
  if (!dateString) return "Invalid Date";

  const date = new Date(dateString);

  if (isNaN(date)) return "Invalid Date";

  date.setDate(date.getDate() + 1);

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

module.exports = { getDateFormat };
