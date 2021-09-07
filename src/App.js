import { useEffect, useState } from "react";
import { IsFirstRender } from "./hooks/disableFirstRenderHook";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import DatePicker from "./components/DatePicker";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import axios from "axios";
import useWindowDimensions from "./hooks/useWindowDimensions";
import {
  getWeight,
  daysBetween,
  getDaysPerTick,
  tickFormatter,
} from "./helpers";
import MainTitle from "./components/MainTitle";

function App() {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [chartData, setChartData] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { width } = useWindowDimensions();
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
            headers: {
              Authorization: `Bearer ${process.env.REACT_APP_AUTHORIZATION}`,
            },
          }
        )
        .then((res) => {
          /** @type {Array} */
          let data = res.data.line_chart_data;

          // Sort fetched data by date
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

            //Sort days range in an empty array
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

            //Sort Q2 and Q4 in different arrays
            questionTwoSum.push(sumQ2);
            questionFourSum.push(sumQ4);
          });

          //Push all filtered results to create a proper data for the chart
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

  const handleSelect = (ranges) => {
    setStartDate(ranges.selection.startDate);
    setEndDate(ranges.selection.endDate);
    setChartData([]);
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

  const chartWidth = () => {
    if (width <= 640) {
      return 450;
    } else if (width <= 768) {
      return 600;
    } else if (width > 768) {
      return 800;
    }
  };

  return (
    <div className="flex flex-col items-center App">
      <MainTitle title={"PLEASE PICK YOUR START AND END DATE"} />
      <DatePicker
        handleSelect={handleSelect}
        startDate={startDate}
        endDate={endDate}
      />

      {!isLoading && (
        <div className="mt-10">
          <BarChart
            width={chartWidth()}
            height={350}
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
          <div>
            <div className="flex justify-center">
              <span className="mr-2 text-blue-600">Q2:</span>
              <p>Reception and admission were</p>
            </div>
            <div className="flex justify-center">
              <span className="mr-2 text-blue-400">Q4:</span>
              <p>​The medical care you received was</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
