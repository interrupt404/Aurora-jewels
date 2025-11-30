"use client";
import React, { useRef, useState, useEffect } from "react";

interface Props {
  min: number;
  max: number;
  valueMin: number;
  valueMax: number;
  onChangeMin: (v: number) => void;
  onChangeMax: (v: number) => void;
  onRelease?: () => void;
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
  const activePointer = useRef<number | null>(null);
  const [dragging, setDragging] = useState<"min" | "max" | null>(null);

  // Convert px → value
  const pxToValue = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return min;

    const ratio = (clientX - rect.left) / rect.width;
    const raw = min + ratio * (max - min);
    return Math.min(max, Math.max(min, Math.round(raw)));
  };

  // When user touches / clicks track → choose closest thumb
  const handleTrackDown = (e: React.PointerEvent) => {
    const clickValue = pxToValue(e.clientX);
    const distMin = Math.abs(clickValue - valueMin);
    const distMax = Math.abs(clickValue - valueMax);

    activePointer.current = e.pointerId;
    trackRef.current?.setPointerCapture(e.pointerId);

    if (distMin <= distMax) {
      setDragging("min");
      onChangeMin(Math.min(clickValue, valueMax));
    } else {
      setDragging("max");
      onChangeMax(Math.max(clickValue, valueMin));
    }
  };

  // Thumb pointer down
  const handleThumbDown = (type: "min" | "max") => (e: React.PointerEvent) => {
    e.stopPropagation();
    activePointer.current = e.pointerId;

    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDragging(type);
  };

  // Move
  const handleMove = (e: PointerEvent) => {
    if (!dragging) return;
    const value = pxToValue(e.clientX);

    if (dragging === "min") {
      onChangeMin(Math.min(value, valueMax));
    } else {
      onChangeMax(Math.max(value, valueMin));
    }
  };

  // Release
  const handleUp = () => {
    if (dragging) onRelease?.();
    setDragging(null);
    activePointer.current = null;
  };

  // Bind global pointer events
  useEffect(() => {
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);

    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  });

  const leftPct = ((valueMin - min) / (max - min)) * 100;
  const rangePct = ((valueMax - valueMin) / (max - min)) * 100;

  return (
    <div className="w-full mt-3 select-none">
      <div
        ref={trackRef}
        onPointerDown={handleTrackDown}
        className="relative h-2 bg-neutral-200 rounded cursor-pointer touch-none"
        style={{ touchAction: "none" }} // Prevent scroll during slider drag
      >
        {/* Selected range */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-2 bg-blue-500 rounded"
          style={{
            left: `${leftPct}%`,
            width: `${rangePct}%`,
          }}
        />

        {/* Min Thumb */}
        <div
          onPointerDown={handleThumbDown("min")}
          className="absolute top-1/2 -translate-y-1/2 h-6 w-6 bg-blue-600 rounded-full shadow cursor-grab active:scale-110 transition"
          style={{
            left: `calc(${leftPct}% - 12px)`,
            touchAction: "none",
          }}
        />

        {/* Max Thumb */}
        <div
          onPointerDown={handleThumbDown("max")}
          className="absolute top-1/2 -translate-y-1/2 h-6 w-6 bg-blue-600 rounded-full shadow cursor-grab active:scale-110 transition"
          style={{
            left: `calc(${leftPct + rangePct}% - 12px)`,
            touchAction: "none",
          }}
        />
      </div>
    </div>
  );
}
