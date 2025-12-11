import * as React from "react";
import { cn } from "../../lib/utils";

type SliderProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  className?: string;
  min?: number;
  max?: number;
};

export function Slider({
  className,
  min = 0,
  max = 100,
  value,
  defaultValue,
  onChange,
  ...props
}: SliderProps) {
  const [internalValue, setInternalValue] = React.useState<number>(() => {
    if (typeof value === "number") return value;
    if (typeof defaultValue === "number") return defaultValue;
    return min;
  });

  React.useEffect(() => {
    if (typeof value === "number") {
      setInternalValue(value);
    }
  }, [value]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = Number(event.target.value);
    setInternalValue(next);
    onChange?.(event);
  };

  const percentage =
    max === min ? 0 : ((internalValue - min) / (max - min)) * 100;

  return (
    <div
      data-slot="slider"
      className={cn(
        "relative flex w-full items-center select-none",
        "data-[disabled=true]:opacity-50",
        className
      )}
    >
      <div
        data-slot="slider-track"
        className="pointer-events-none absolute inset-x-0 h-1.5 rounded-full bg-white/10"
      />
      <div
        data-slot="slider-range"
        className="pointer-events-none absolute h-1.5 rounded-full bg-white/80"
        style={{ width: `${percentage}%` }}
      />
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        defaultValue={defaultValue}
        onChange={handleChange}
        data-slot="slider-thumb"
        className={cn(
          "relative z-10 w-full cursor-pointer appearance-none bg-transparent",
          "focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          "[&::-webkit-slider-runnable-track]:h-1.5 [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-runnable-track]:rounded-full",
          "[&::-moz-range-track]:h-1.5 [&::-moz-range-track]:bg-transparent [&::-moz-range-track]:rounded-full",
          "[&::-webkit-slider-thumb]:appearance-none",
          "[&::-webkit-slider-thumb]:size-4",
          "[&::-webkit-slider-thumb]:rounded-full",
          "[&::-webkit-slider-thumb]:border",
          "[&::-webkit-slider-thumb]:border-white/70",
          "[&::-webkit-slider-thumb]:bg-black",
          "[&::-webkit-slider-thumb]:shadow-sm",
          "[&::-webkit-slider-thumb]:transition-[box-shadow,transform]",
          "hover:[&::-webkit-slider-thumb]:ring-4",
          "hover:[&::-webkit-slider-thumb]:ring-white/30",
          "focus-visible:[&::-webkit-slider-thumb]:ring-4",
          "focus-visible:[&::-webkit-slider-thumb]:ring-white/30"
        )}
        {...props}
      />
    </div>
  );
}
