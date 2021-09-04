import "./chart.css";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

import { data } from "../data/chart-data";

const monthTickFormatter = (tick) => {
  const date = new Date(tick);

  return date.getMonth() + 1;
};

const renderQuarterTick = (tickProps) => {
  const { x, y, payload } = tickProps;
  const { value, offset } = payload;
  const date = new Date(value);
  const month = date.getMonth();
  const quarterNo = Math.floor(month / 3) + 1;

  if (month % 3 === 1) {
    return <text x={x} y={y - 4} textAnchor="middle">{`Q${quarterNo}`}</text>;
  }

  const isLast = month === 11;

  if (month % 3 === 0 || isLast) {
    const pathX = Math.floor(isLast ? x + offset : x - offset) + 0.5;

    return <path d={`M${pathX},${y - 4}v${-35}`} stroke="#88c1fc" />;
  }
  return null;
};

export default function Chart() {
  return (
    <BarChart
      width={600}
      height={300}
      data={data}
      margin={{
        top: 5,
        right: 30,
        left: 20,
        bottom: 5,
      }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="date" tickFormatter={monthTickFormatter} />
      <XAxis
        dataKey="date"
        axisLine={false}
        tickLine={false}
        interval={0}
        tick={renderQuarterTick}
        height={1}
        scale="band"
        xAxisId="quarter"
      />
      <YAxis />
      <Tooltip />

      <Legend wrapperStyle={{ paddingTop: "10px" }} />

      <Bar dataKey="pv" fill="#0B79EC" />
      <Bar dataKey="uv" fill="#88c1fc" />
    </BarChart>
  );
}
