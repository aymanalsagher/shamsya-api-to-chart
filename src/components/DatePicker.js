import { DateRangePicker } from "react-date-range";

const DatePicker = ({ handleSelect, startDate, endDate }) => {
  const selectionRange = {
    startDate,
    endDate,
    key: "selection",
  };

  return (
    <>
      <DateRangePicker
        className="mt-5"
        ranges={[selectionRange]}
        rangeColors={["#0B79EC"]}
        maxDate={new Date()}
        onChange={handleSelect}
      />
    </>
  );
};

export default DatePicker;
