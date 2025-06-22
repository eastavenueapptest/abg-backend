const getStatusLabel = (statusCode) => {
  switch (statusCode) {
    case 0:
      return "Pending";
    case 1:
      return "On Process";
    case 3:
      return "For Review";
    case 4:
      return "Relaease";
    default:
      return "Unknown";
  }
};

module.exports = {
  getStatusLabel,
};
