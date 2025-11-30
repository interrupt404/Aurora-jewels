"use client";
import React, { useRef, useState, useEffect } from "react";

interface Props {
  min: number;
  max: number;
  valueMin: number;
  valueMax: number;
  onChangeMin: (v: number) => void;
  onChangeMax: (v: number) => void;
  onRelease?: () => void; // API call on release
}

export default function DualSlider({
  min,
  max,
  valueMin,
  valueMax,
  onChangeMin,
  onChangeMax,
  onRelease,
}: Props) {

  const trackRef = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState<"min" | "max" | null>(null);

  // Convert pixel → value
  const pxToValue = (clientX: number) => {
    const rect = trackRef.current!.getBoundingClientRect();
    const ratio = (clientX - rect.left) / rect.width;
    return Math.min(max, Math.max(min, Math.round(min + ratio * (max - min))));
  };

  // Handle mouse down on TRACK → choose closest thumb 👍
  const handleTrackMouseDown = (e: React.MouseEvent) => {
    const clickValue = pxToValue(e.clientX);

    const distMin = Math.abs(clickValue - valueMin);
    const distMax = Math.abs(clickValue - valueMax);

    // nearest thumb wins
    if (distMin < distMax) {
      setDragging("min");
      onChangeMin(clickValue);
    } else {
      setDragging("max");
      onChangeMax(clickValue);
    }
  };

  // Move selected thumb
  const handleMouseMove = (e: MouseEvent) => {
    if (!dragging) return;
    const newValue = pxToValue(e.clientX);

    if (dragging === "min") {
      onChangeMin(Math.min(newValue, valueMax));
    } else {
      onChangeMax(Math.max(newValue, valueMin));
    }
  };

  // End drag → API call
  const handleMouseUp = () => {
    if (dragging) onRelease?.();
    setDragging(null);
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  });

  return (
    <div className="w-full mt-3 select-none">
      {/* TRACK */}
      <div
        ref={trackRef}
        onMouseDown={handleTrackMouseDown}
        className="relative h-2 bg-neutral-200 rounded cursor-pointer"
      >
        {/* BLUE SELECTED RANGE */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-2 bg-blue-500 rounded transition-all"
          style={{
            left: `${(valueMin / max) * 100}%`,
            width: `${((valueMax - valueMin) / max) * 100}%`,
          }}
        />

        {/* MIN THUMB */}
        <div
          onMouseDown={() => setDragging("min")}
          className="absolute top-1/2 -translate-y-1/2 h-5 w-5 bg-blue-600 rounded-full shadow cursor-grab active:scale-110 transition"
          style={{
            left: `calc(${(valueMin / max) * 100}% - 10px)`,
          }}
        />

        {/* MAX THUMB */}
        <div
          onMouseDown={() => setDragging("max")}
          className="absolute top-1/2 -translate-y-1/2 h-5 w-5 bg-blue-600 rounded-full shadow cursor-grab active:scale-110 transition"
          style={{
            left: `calc(${(valueMax / max) * 100}% - 10px)`,
          }}
        />
      </div>
    </div>
  );
}
