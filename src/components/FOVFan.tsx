import React from 'react';

interface FOVFanProps {
  degrees: number;
}

export const FOVFan: React.FC<FOVFanProps> = ({ degrees }) => {
  const radius = 40;
  const centerX = 50;
  const centerY = 50;
  const startAngle = -90 - degrees / 2;
  const endAngle = -90 + degrees / 2;

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  const start = polarToCartesian(centerX, centerY, radius, endAngle);
  const end = polarToCartesian(centerX, centerY, radius, startAngle);
  const largeArcFlag = degrees <= 180 ? "0" : "1";

  if (degrees >= 360) {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="50" r="45" className="fill-none stroke-black/10 dark:stroke-white/10 stroke-1" />
        <circle cx="50" cy="50" r={radius} className="fill-orange-500/40 stroke-orange-500 stroke-1" />
        <circle cx="50" cy="50" r="2" className="fill-black dark:fill-white" />
      </svg>
    );
  }

  const d = [
    "M", centerX, centerY,
    "L", start.x, start.y,
    "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
    "Z"
  ].join(" ");

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <circle cx="50" cy="50" r="45" className="fill-none stroke-black/10 dark:stroke-white/10 stroke-1" />
      <path d={d} className="fill-orange-500/40 stroke-orange-500 stroke-1" />
      <circle cx="50" cy="50" r="2" className="fill-black dark:fill-white" />
    </svg>
  );
};
