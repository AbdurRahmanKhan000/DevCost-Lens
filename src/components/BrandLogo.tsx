import React from "react";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = "md",
  showText = true,
  className = "",
}) => {
  const iconDimensions = {
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-11 h-11",
    xl: "w-14 h-14",
  }[size];

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl",
  }[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Iconic Lens + Cost + AI Symbol */}
      <div className={`relative ${iconDimensions} flex items-center justify-center group`}>
        {/* Ambient Glow */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-cyan-500/30 via-teal-400/20 to-emerald-500/30 blur-md group-hover:blur-lg transition-all duration-300" />

        {/* Optical Lens Outer Bezel */}
        <div className="relative w-full h-full rounded-xl bg-zinc-900 border border-cyan-500/40 shadow-inner p-1.5 flex items-center justify-center overflow-hidden">
          {/* Subtle Grid & Lens Aperture lines */}
          <div className="absolute inset-0 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:6px_6px] opacity-25" />

          {/* Concentric Meter Rings & SVG Icon */}
          <svg
            viewBox="0 0 36 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full relative z-10 transition-transform duration-500 group-hover:rotate-12"
          >
            {/* Outer Lens Aperture Segments */}
            <circle
              cx="18"
              cy="18"
              r="15"
              stroke="url(#lensGrad)"
              strokeWidth="1.8"
              strokeDasharray="4 2 8 2"
              strokeLinecap="round"
              className="opacity-70"
            />

            {/* Inner Power / Electricity Pulse Ring */}
            <circle
              cx="18"
              cy="18"
              r="11"
              stroke="#22d3ee"
              strokeWidth="1.2"
              strokeOpacity="0.4"
            />

            {/* AI Neural Spark Nodes */}
            <circle cx="18" cy="4" r="1.5" fill="#38bdf8" />
            <circle cx="32" cy="18" r="1.5" fill="#10b981" />
            <circle cx="18" cy="32" r="1.5" fill="#06b6d4" />
            <circle cx="4" cy="18" r="1.5" fill="#3b82f6" />

            {/* Central Currency Meter Core ($ + AI Wave) */}
            <path
              d="M18 8.5V27.5M21.5 12.5C21.5 10.8431 20.1569 9.5 18.5 9.5H16C14.3431 9.5 13 10.8431 13 12.5C13 14.1569 14.3431 15.5 16 15.5H20C21.6569 15.5 23 16.8431 23 18.5C23 20.1569 21.6569 21.5 20 21.5H16C14.3431 21.5 13 20.1569 13 18.5"
              stroke="url(#coreGrad)"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <defs>
              <linearGradient id="lensGrad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                <stop stopColor="#06b6d4" />
                <stop offset="0.5" stopColor="#10b981" />
                <stop offset="1" stopColor="#3b82f6" />
              </linearGradient>
              <linearGradient id="coreGrad" x1="13" y1="8" x2="23" y2="28" gradientUnits="userSpaceOnUse">
                <stop stopColor="#ffffff" />
                <stop offset="0.6" stopColor="#67e8f9" />
                <stop offset="1" stopColor="#34d399" />
              </linearGradient>
            </defs>
          </svg>

          {/* Real-time Meter Blinking Status Dot */}
          <span className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-500" />
        </div>
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex items-center tracking-tight">
          <span className={`font-extrabold ${textSizes} tracking-tight text-white dark:text-white`}>
            DevCost
          </span>
          <span className={`font-bold ${textSizes} ml-1 bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent`}>
            Lens
          </span>
        </div>
      )}
    </div>
  );
};
