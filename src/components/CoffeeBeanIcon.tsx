import React from 'react';

export const CoffeeBeanIcon: React.FC<{ className?: string }> = ({
  className = 'w-6 h-6',
}) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <g transform="translate(12, 12) rotate(-32) translate(-12, -12)">
        {/* Tělo kávového zrnka */}
        <ellipse
          cx="12"
          cy="12"
          rx="6.6"
          ry="9.6"
          fill="currentColor"
        />
        {/* Charakteristická středová rýha kávového zrna */}
        <path
          d="M12 4C10.5 7.5 10 9.8 12.4 12s1.9 4.5-.4 8"
          stroke="#1C140D"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
};

