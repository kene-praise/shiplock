interface SeparatorProps {
  orientation?: "horizontal" | "vertical";
  className?: string;
}

export function Separator({ orientation = "horizontal", className = "" }: SeparatorProps) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={[
        orientation === "horizontal"
          ? "w-full h-px bg-[var(--border)]"
          : "w-px h-full bg-[var(--border)]",
        className,
      ].join(" ")}
    />
  );
}
