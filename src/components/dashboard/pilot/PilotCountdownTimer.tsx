"use client";

import { useEffect, useState } from "react";

type PilotCountdownTimerProps = {
  unlockAt: string;
  className?: string;
};

function formatCountdown(ms: number): string {
  if (ms <= 0) return "00:00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds]
    .map((v) => v.toString().padStart(2, "0"))
    .join(":");
}

export function PilotCountdownTimer({
  unlockAt,
  className,
}: PilotCountdownTimerProps) {
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, new Date(unlockAt).getTime() - Date.now()),
  );

  useEffect(() => {
    const tick = () => {
      setRemaining(Math.max(0, new Date(unlockAt).getTime() - Date.now()));
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [unlockAt]);

  return (
    <span className={className ?? "pilot-dashboard-countdown-value"}>
      {formatCountdown(remaining)}
    </span>
  );
}
