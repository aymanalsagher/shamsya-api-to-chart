import { useEffect, useState } from "react";
import "react-date-range/dist/styles.css"; // main css file
import "react-date-range/dist/theme/default.css"; // theme css file
import { DateRangePicker } from "react-date-range";
import axios from "axios";
// import fetchApiData from "../api/api-requests";

const DatePicker = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const handleSelect = (ranges) => {
    setStartDate(ranges.selection.startDate);
    setEndDate(ranges.selection.endDate);
    // fetchApiData(startDate, endDate);
  };

  const treatAsUTC = (date) => {
    var result = new Date(date);
    result.setMinutes(result.getMinutes() - result.getTimezoneOffset());
    return result;
  };

  const daysBetween = (startDate, endDate) => {
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    return (treatAsUTC(endDate) - treatAsUTC(startDate)) / millisecondsPerDay;
  };

  const getTicksNo = (daysNo) => {
    const tempTicksNo = 10;

    if (daysNo <= tempTicksNo) {
      return daysNo;
    } else {
      return tempTicksNo;
    }
  };

  const getDaysPerTick = (daysNo, ticksNo) => {
    if (daysNo <= ticksNo) {
      return daysNo;
    } else {
      return Math.ceil(daysNo / ticksNo);
    }
  };

  useEffect(() => {
    const fixedStartDate = startDate.toISOString().slice(0, 10);
    const fixedEndDate = endDate.toISOString().slice(0, 10);
    const daysNo = daysBetween(startDate, endDate);
    const ticksNo = getTicksNo(daysNo);
    const daysPerTick = getDaysPerTick(daysNo, ticksNo);

    //Fetch data based on the selected date

    axios
      .get(
        `https://staging.mymelior.com/v1/branches/1/progress?date_from=${fixedStartDate}&date_to=${fixedEndDate}`,
        { headers: { Authorization: "Bearer SLSmxK17vjRInEWIiFQjwE1QIDfeSM" } }
      )
      .then((res) => {
        let data = res.data.line_chart_data;

        data.sort(function (a, b) {
          return a.submitted_at < b.submitted_at
            ? -1
            : a.submitted_at > b.submitted_at
            ? 1
            : 0;
        });

        console.log(data[109]);

        // console.log(res.data.line_chart_data);
        // console.log(res.data.line_chart_data[0]);
        //console.log(sortedDataByDate);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [startDate, endDate]);

  const selectionRange = {
    startDate,
    endDate,
    key: "selection",
  };

  return (
    <DateRangePicker
      ranges={[selectionRange]}
      rangeColors={["#0B79EC"]}
      maxDate={new Date()}
      onChange={handleSelect}
    />
  );
};

export default DatePicker;
