"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

type DashboardModalPortalProps = {
  children: ReactNode;
  /** Lock document scroll while open (default true). */
  lockScroll?: boolean;
};

/**
 * Renders dialog UI on `document.body` so `position: fixed` is never clipped
 * by dashboard shell overflow/stacking contexts.
 */
export function DashboardModalPortal({
  children,
  lockScroll = true,
}: DashboardModalPortalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !lockScroll) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mounted, lockScroll]);

  if (!mounted) return null;
  return createPortal(children, document.body);
}
