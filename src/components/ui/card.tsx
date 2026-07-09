interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  hoverable?: boolean;
  variant?: "default" | "inset";
}

export function Card({
  children,
  className = "",
  padding = "md",
  hoverable = false,
  variant = "default",
}: CardProps) {
  const paddingClasses = {
    none: "",
    sm: "p-3",
    md: "p-5",
    lg: "p-6",
  };

  return (
    <div
      className={[
        "rounded-[var(--radius-lg)] overflow-hidden",
        variant === "default"
          ? "bg-[var(--surface)] border border-[var(--border)]"
          : "bg-[var(--bg-subtle)] border border-[var(--border)]",
        "transition-[border-color,box-shadow] duration-150",
        hoverable &&
          "hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-sm)] cursor-pointer",
        padding !== "none" ? paddingClasses[padding] : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}

interface CardSectionProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className = "" }: CardSectionProps) {
  return <div className={["mb-4", className].join(" ")}>{children}</div>;
}

export function CardBody({ children, className = "" }: CardSectionProps) {
  return <div className={className}>{children}</div>;
}

/**
 * CardFooter — the gray strip at the bottom of a card.
 * White content above, subtle gray band below.
 */
export function CardFooter({ children, className = "" }: CardSectionProps) {
  return (
    <div
      className={["px-5 py-3", className].join(" ")}
      style={{
        background: "var(--card-footer)",
        borderTop: "1px solid var(--border-footer)",
      }}
    >
      {children}
    </div>
  );
}
