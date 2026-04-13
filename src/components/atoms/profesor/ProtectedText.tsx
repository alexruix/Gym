import React from "react";
import { cn } from "@/lib/utils";

interface ProtectedTextProps {
  text: string;
  className?: string;
  tag?: "span" | "div" | "p";
}

/**
 * ProtectedText: Atom designed to stop manual copying and basic console scraping.
 * It scrambles the DOM order using CSS flexbox 'order', so .innerText returns a jumbled mess
 * while the visual output remains perfectly readable.
 */
export function ProtectedText({ text, className, tag: Tag = "span" }: ProtectedTextProps) {
  if (!text) return null;

  // Split into characters and assign random display order that matches logical order
  const characters = text.split("").map((char, index) => ({
    char,
    index,
    // Add a bit of noise characters that are hidden (optional, but let's keep it clean first)
  }));

  // Shuffle for DOM insertion
  const shuffled = [...characters].sort(() => Math.random() - 0.5);

  return (
    <Tag 
      className={cn(
        "inline-flex flex-wrap select-none pointer-events-none cursor-default transition-opacity",
        className
      )}
      onContextMenu={(e) => e.preventDefault()}
      onCopy={(e) => e.preventDefault()}
    >
      {shuffled.map((item, i) => (
        <span 
          key={i} 
          style={{ order: item.index }}
          className="whitespace-pre"
        >
          {item.char}
        </span>
      ))}
    </Tag>
  );
}
