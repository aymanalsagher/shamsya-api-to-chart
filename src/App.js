import Chart from "./components/chart";
import DatePicker from "./components/date-picker";

function App() {
  return (
    <div className="flex flex-col items-center my-10 App">
      <div className="mt-20">
        <DatePicker />
      </div>
      <div className="mt-20">
        <Chart />
      </div>
    </div>
  );
}

export default App;
