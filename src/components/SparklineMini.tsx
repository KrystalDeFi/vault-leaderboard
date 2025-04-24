
import React from "react";

interface SparklineMiniProps {
  values: number[];
  width?: number;
  height?: number;
  color?: string;
}

const SparklineMini = ({
  values,
  width = 56,
  height = 18,
  color = "#22d3ee", // cyan-400
}: SparklineMiniProps) => {
  if (!values || values.length === 0) {
    return null;
  }
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * (width - 2);
      const y = height - ((v - min) / range) * (height - 2) - 1;
      return `${x + 1},${y}`;
    })
    .join(" ");
  return (
    <svg
      width={width}
      height={height}
      className="inline-flex align-middle"
      style={{ display: "inline-block" }}
    >
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        points={points}
      />
      <circle
        cx={width - 1}
        cy={
          height - ((values[values.length - 1] - min) / range) * (height - 2) - 1
        }
        r="2"
        fill={color}
      />
    </svg>
  );
};

export default SparklineMini;
