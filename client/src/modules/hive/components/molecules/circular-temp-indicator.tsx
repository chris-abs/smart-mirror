type CircularTempIndicatorProps = {
  temperature: number | null;
  size?: number;
};

export function CircularTempIndicator({
  temperature,
  size = 120,
}: CircularTempIndicatorProps) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  
  const minTemp = 5;
  const maxTemp = 30;
  const temp = temperature ?? minTemp;
  const progress = Math.max(0, Math.min(1, (temp - minTemp) / (maxTemp - minTemp)));
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="4"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#tempGradient)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-300"
        />
        <defs>
          <linearGradient id="tempGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(147, 197, 253, 0.8)" />
            <stop offset="100%" stopColor="rgba(96, 165, 250, 0.8)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-3xl font-semibold leading-none">
            {temperature !== null ? Math.round(temperature) : "--"}
          </div>
          <div className="text-xs opacity-60 mt-0.5">°C</div>
        </div>
      </div>
    </div>
  );
}


