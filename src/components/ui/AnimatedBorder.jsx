import React from "react";

const AnimatedBorder = ({ progress, width, height }) => {
  const borderWidth = 2; // Thinner border for better look
  
  // If dimensions aren't ready, don't render or render transparent
  if (!width || !height) return null;

  // total length of the rectangle path
  const totalLength = 2 * (width + height);

  // calculate dash offset based on progress
  const dashOffset = totalLength * (1 - progress / 100);

  return (
    <svg
      width={width}
      height={height}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        pointerEvents: "none",
        zIndex: 10,
        borderRadius: "1rem", // Match rounded-2xl (16px)
      }}
      className="rounded-2xl"
    >
      <rect
        x={borderWidth / 2}
        y={borderWidth / 2}
        width={width - borderWidth}
        height={height - borderWidth}
        rx={16} // Match rounded-2xl
        ry={16}
        fill="transparent"
        stroke="#8b5cf6" // Violet-500 to match theme
        strokeWidth={borderWidth}
        strokeDasharray={totalLength}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
      />
    </svg>
  );
};

export default AnimatedBorder;
