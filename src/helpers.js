export const getWeight = (choiceNo) => {
  switch (choiceNo) {
    case 1:
      return -1;
    case 4:
      return 1;
    case 6:
      return 0;

    default: //Do nothing
  }
};

export const treatAsUTC = (date) => {
  var result = new Date(date);
  result.setMinutes(result.getMinutes() - result.getTimezoneOffset());
  return result;
};

export const daysBetween = (startDate, endDate) => {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  return (treatAsUTC(endDate) - treatAsUTC(startDate)) / millisecondsPerDay;
};

export const getDaysPerTick = (daysNo, ticksNo) => {
  if (daysNo <= ticksNo) {
    return daysNo;
  } else {
    return Math.ceil(daysNo / ticksNo);
  }
};

export const tickFormatter = (value, i) => {
  return i + 1;
};
