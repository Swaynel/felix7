import { type ReactNode } from "react";

type CoverArtProps = {
  hue: number;
  label: string;
  className?: string;
  aspect?: "square" | "portrait";
  children?: ReactNode;
};

/**
 * Procedural cover artwork. Renders a noisy crimson-tinted gradient with
 * the release/product initials. Use until real artwork is uploaded.
 */
export function CoverArt({
  hue,
  label,
  className = "",
  aspect = "square",
  children,
}: CoverArtProps) {
  const aspectClass = aspect === "square" ? "aspect-square" : "aspect-[4/5]";
  const bg = `radial-gradient(120% 80% at 30% 20%, hsl(${hue} 70% 28% / 0.95) 0%, hsl(${hue} 80% 12% / 1) 45%, #09090b 100%)`;

  return (
    <div
      className={`relative overflow-hidden rounded-md outline-1 -outline-offset-1 outline-white/5 ${aspectClass} ${className}`}
      style={{ background: bg }}
    >
      {/* film grain */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.18] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/><feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
        }}
      />
      {/* sigil */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-display text-6xl md:text-7xl text-accent/90 drop-shadow-[0_0_24px_rgba(220,38,38,0.55)]">
          {label}
        </span>
      </div>
      {/* corner cross */}
      <div className="absolute right-3 top-3 text-[9px] tracking-[0.3em] uppercase text-white/40">
        ✝ feli7x
      </div>
      {children}
    </div>
  );
}
