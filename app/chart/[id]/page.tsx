"use client";
import React, { PureComponent } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Props = {
  params: { id: string };
};

const bitcoinPriceData = [
  { timestamp: "2024-01-01T00:00:00Z", price: 65000 },
  { timestamp: "2024-01-02T00:00:00Z", price: 65200 },
  { timestamp: "2024-01-03T00:00:00Z", price: 65500 },
  { timestamp: "2024-01-04T00:00:00Z", price: 65750 },
  { timestamp: "2024-01-05T00:00:00Z", price: 66000 },
  { timestamp: "2024-01-06T00:00:00Z", price: 66250 },
  { timestamp: "2024-01-07T00:00:00Z", price: 66400 },
  { timestamp: "2024-01-08T00:00:00Z", price: 66550 },
  { timestamp: "2024-01-09T00:00:00Z", price: 66700 },
  { timestamp: "2024-01-10T00:00:00Z", price: 66900 },
  { timestamp: "2024-01-11T00:00:00Z", price: 67050 },
  { timestamp: "2024-01-12T00:00:00Z", price: 67200 },
  { timestamp: "2024-01-13T00:00:00Z", price: 67350 },
  { timestamp: "2024-01-14T00:00:00Z", price: 67500 },
  { timestamp: "2024-01-15T00:00:00Z", price: 67650 },
  { timestamp: "2024-01-16T00:00:00Z", price: 67800 },
  { timestamp: "2024-01-17T00:00:00Z", price: 67950 },
  { timestamp: "2024-01-18T00:00:00Z", price: 68000 },
  { timestamp: "2024-01-19T00:00:00Z", price: 68100 },
  { timestamp: "2024-01-20T00:00:00Z", price: 68250 },
  { timestamp: "2024-01-21T00:00:00Z", price: 68400 },
  { timestamp: "2024-01-22T00:00:00Z", price: 68550 },
  { timestamp: "2024-01-23T00:00:00Z", price: 68700 },
  { timestamp: "2024-01-24T00:00:00Z", price: 68850 },
  { timestamp: "2024-01-25T00:00:00Z", price: 69000 },
  { timestamp: "2024-01-26T00:00:00Z", price: 69150 },
  { timestamp: "2024-01-27T00:00:00Z", price: 69300 },
  { timestamp: "2024-01-28T00:00:00Z", price: 69450 },
  { timestamp: "2024-01-29T00:00:00Z", price: 69600 },
  { timestamp: "2024-01-30T00:00:00Z", price: 69750 },
  { timestamp: "2024-01-31T00:00:00Z", price: 69900 },
  { timestamp: "2024-02-01T00:00:00Z", price: 70000 },
  { timestamp: "2024-02-02T00:00:00Z", price: 70150 },
  { timestamp: "2024-02-03T00:00:00Z", price: 70300 },
  { timestamp: "2024-02-04T00:00:00Z", price: 70450 },
  { timestamp: "2024-02-05T00:00:00Z", price: 70600 },
  { timestamp: "2024-02-06T00:00:00Z", price: 70750 },
  { timestamp: "2024-02-07T00:00:00Z", price: 70900 },
  { timestamp: "2024-02-08T00:00:00Z", price: 71050 },
  { timestamp: "2024-02-09T00:00:00Z", price: 71200 },
  { timestamp: "2024-02-10T00:00:00Z", price: 71350 },
  { timestamp: "2024-02-11T00:00:00Z", price: 71500 },
  { timestamp: "2024-02-12T00:00:00Z", price: 71650 },
  { timestamp: "2024-02-13T00:00:00Z", price: 71800 },
  { timestamp: "2024-02-14T00:00:00Z", price: 71950 },
  { timestamp: "2024-02-15T00:00:00Z", price: 72100 },
  { timestamp: "2024-02-16T00:00:00Z", price: 72250 },
  { timestamp: "2024-02-17T00:00:00Z", price: 72400 },
  { timestamp: "2024-02-18T00:00:00Z", price: 72550 },
  { timestamp: "2024-02-19T00:00:00Z", price: 72700 },
  { timestamp: "2024-02-20T00:00:00Z", price: 72850 },
  { timestamp: "2024-02-21T00:00:00Z", price: 73000 },
  { timestamp: "2024-02-22T00:00:00Z", price: 73150 },
  { timestamp: "2024-02-23T00:00:00Z", price: 73300 },
  { timestamp: "2024-02-24T00:00:00Z", price: 73450 },
  { timestamp: "2024-02-25T00:00:00Z", price: 73600 },
  { timestamp: "2024-02-26T00:00:00Z", price: 73750 },
  { timestamp: "2024-02-27T00:00:00Z", price: 73900 },
  { timestamp: "2024-02-28T00:00:00Z", price: 74050 },
  { timestamp: "2024-02-29T00:00:00Z", price: 74200 },
];
const CoinChart = ({ params: { id } }: Props) => {
  return (
    <div style={{ width: "100%", height: 400 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={bitcoinPriceData}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" />
          <YAxis />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="price"
            stroke="#8884d8"
            fill="#8884d8"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CoinChart;
