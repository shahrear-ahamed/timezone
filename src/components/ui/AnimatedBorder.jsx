import React from "react";

const AnimatedBorder = ({ progress }) => {
  const width = 500; // table width
  const height = 300; // table height
  const borderWidth = 4;

  // total length of the rectangle path
  const totalLength = 2 * (width + height);

  // calculate dash offset based on progress
  const dashOffset = totalLength * (1 - progress / 100);

  return (
    <svg
      width={width + borderWidth * 2}
      height={height + borderWidth * 2}
      style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
    >
      <rect
        x={borderWidth / 2}
        y={borderWidth / 2}
        width={width}
        height={height}
        fill="transparent"
        stroke="#10b981"
        strokeWidth={borderWidth}
        strokeDasharray={totalLength}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
      />
    </svg>
  );
};

export default AnimatedBorder;
