"use client";

import { useEffect, useState } from "react";

const CHAR_MS = 16;

export function TypewriterMessage({
  text,
  animate,
}: {
  text: string;
  animate: boolean;
}) {
  const [visible, setVisible] = useState(animate ? "" : text);

  useEffect(() => {
    if (!animate) {
      setVisible(text);
      return;
    }

    setVisible("");
    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setVisible(text.slice(0, index));
      if (index >= text.length) {
        window.clearInterval(timer);
      }
    }, CHAR_MS);

    return () => window.clearInterval(timer);
  }, [text, animate]);

  return <span className="whitespace-pre-wrap">{visible}</span>;
}
