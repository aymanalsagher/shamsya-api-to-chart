import { useEffect, useState } from "react";
import { IsFirstRender } from "./hooks/disableFirstRenderHook";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { DateRangePicker } from "react-date-range";
// prettier-ignore
import { BarChart,Bar,XAxis,YAxis,CartesianGrid,Tooltip,Legend} from "recharts";
import axios from "axios";
import useWindowDimensions from "./hooks/useWindowDimensions";

function App() {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [chartData, setChartData] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { height, width } = useWindowDimensions();
  const [currentWidth, setCurrentWidth] = useState(window.innerWidth);
  const [totalTicks, setTotalTicks] = useState(10);

  const isMount = IsFirstRender();

  const rangeData = [];
  const daysRanges = [];
  const questionTwoSum = [];
  const questionFourSum = [];

  useEffect(() => {
    if (isMount) {
      return;
    } else {
      const fixedStartDate = startDate.toISOString().slice(0, 10);
      const fixedEndDate = endDate.toISOString().slice(0, 10);
      const daysNo = daysBetween(startDate, endDate);
      adjustTicks(daysNo);
      const daysPerTick = getDaysPerTick(daysNo, totalTicks);

      //Fetch data based by the selected date range
      if (currentWidth !== width) {
        setChartData([]);
        setCurrentWidth(width);
        return;
      }
      setIsLoading(true);
      axios
        .get(
          `https://staging.mymelior.com/v1/branches/1/progress?date_from=${fixedStartDate}&date_to=${fixedEndDate}`,
          {
            headers: { Authorization: "Bearer SLSmxK17vjRInEWIiFQjwE1QIDfeSM" },
          }
        )
        .then((res) => {
          // Sort fetched data by date
          /** @type {Array} */
          let data = res.data.line_chart_data;

          data.sort(function (a, b) {
            return a.submitted_at < b.submitted_at
              ? -1
              : a.submitted_at > b.submitted_at
              ? 1
              : 0;
          });

          // Defining start and end of first range
          const tmpStartDate = new Date(fixedStartDate);
          tmpStartDate.setDate(tmpStartDate.getDate() + 1);

          const tmpEndDate = new Date(tmpStartDate);
          tmpEndDate.setDate(tmpEndDate.getDate() + daysPerTick);

          // Filter and fill the data separated in ranges
          for (let i = 0; i < totalTicks; i++) {
            // Filter date per range
            const tmpRangeData = data.filter((day) => {
              const submittedAt = new Date(day.submitted_at);
              return (
                tmpStartDate.getTime() <= submittedAt.getTime() &&
                submittedAt.getTime() <= tmpEndDate.getTime()
              );
            });

            // Save filtered data in external array
            rangeData.push(tmpRangeData);

            // Formatted Date Range
            tmpStartDate.toISOString().slice(0, 10);
            tmpEndDate.toISOString().slice(0, 10);

            daysRanges.push(
              tmpStartDate.toISOString().slice(0, 10) +
                "/" +
                tmpEndDate.toISOString().slice(0, 10)
            );

            // Increment logic to advance one step to the next range selection
            if (tmpStartDate.getMonth() !== tmpEndDate.getMonth()) {
              tmpStartDate.setMonth(tmpEndDate.getMonth());
              tmpStartDate.setFullYear(tmpEndDate.getFullYear());
            }
            tmpStartDate.setDate(tmpEndDate.getDate() + 1);
            tmpEndDate.setDate(tmpStartDate.getDate() + daysPerTick);
          }

          // Logic for filtering and calculating weight for question 2 and 4

          rangeData.forEach((range) => {
            let sumQ2 = 0;
            let sumQ4 = 0;
            range.forEach((rangeObject) => {
              const answerQ2 = rangeObject.answers.find(
                (answerObject) => answerObject.question === 2
              );
              sumQ2 = sumQ2 + getWeight(answerQ2.choice);

              const answerQ4 = rangeObject.answers.find(
                (answerObject) => answerObject.question === 4
              );
              sumQ4 = sumQ4 + getWeight(answerQ4.choice);
            });

            questionTwoSum.push(sumQ2);
            questionFourSum.push(sumQ4);
          });

          for (let i = 0; i < rangeData.length; i++) {
            chartData.push({
              daysRange: daysRanges[i],
              Q2: questionTwoSum[i],
              Q4: questionFourSum[i],
            });
          }
          setIsLoading(false);
        })
        .catch((err) => {
          setError(err);
        });
    }
  }, [endDate, isMount, chartData, width]);

  const getWeight = (choiceNo) => {
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

  const handleSelect = (ranges) => {
    setStartDate(ranges.selection.startDate);
    setEndDate(ranges.selection.endDate);
    setChartData([]);
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

  const adjustTicks = (daysNo) => {
    if (width <= 640) {
      setTotalTicks(4);
    } else if (width <= 768) {
      setTotalTicks(6);
    } else if (width > 768) {
      setTotalTicks(10);
    }

    if (daysNo <= totalTicks && daysNo !== 0) {
      setTotalTicks(daysNo);
    }
  };

  const getDaysPerTick = (daysNo, ticksNo) => {
    if (daysNo <= ticksNo) {
      return daysNo;
    } else {
      return Math.ceil(daysNo / ticksNo);
    }
  };

  const tickFormatter = (value, i) => {
    return i + 1;
  };

  const chartWidth = () => {
    if (width <= 640) {
      return 450;
    } else if (width <= 768) {
      return 600;
    } else if (width > 768) {
      return 800;
    }
  };

  const selectionRange = {
    startDate,
    endDate,
    key: "selection",
  };

  return (
    <div className="flex flex-col items-center my-10 App">
      {error && <div>{"Please choose a proper date"}</div>}
      <div className="mt-20">
        <DateRangePicker
          ranges={[selectionRange]}
          rangeColors={["#0B79EC"]}
          maxDate={new Date()}
          onChange={handleSelect}
        />
      </div>
      {!isLoading && (
        <div className="mt-20">
          <BarChart
            width={chartWidth()}
            height={400}
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="daysRange" tickFormatter={tickFormatter} />
            <YAxis />
            <Tooltip />
            <Legend wrapperStyle={{ paddingTop: "10px" }} />
            <Bar dataKey="Q2" fill="#0B79EC" />
            <Bar dataKey="Q4" fill="#88c1fc" />
          </BarChart>
        </div>
      )}
    </div>
  );
}

export default App;
