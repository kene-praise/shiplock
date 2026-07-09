interface AvatarProps {
  src?: string;
  alt?: string;
  initials?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  style?: React.CSSProperties;
}

const sizeClasses = {
  xs: "w-6 h-6 text-[11px]",
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-lg",
};

export function Avatar({ src, alt = "", initials, size = "md", className = "", style }: AvatarProps) {
  return (
    <div
      className={[
        "rounded-full overflow-hidden shrink-0 flex items-center justify-center font-medium",
        "bg-[var(--accent-muted)] text-[var(--accent)]",
        sizeClasses[size],
        className,
      ].join(" ")}
      style={style}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          style={{
            outline: "1px solid rgba(255, 255, 255, 0.1)",
            outlineOffset: "-1px",
          }}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}
