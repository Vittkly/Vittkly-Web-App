import React, { useId } from "react";

/** Fondo geométrico decorativo reutilizable para las pantallas de autenticación. */
export function AuthBackdrop() {
  const uid = useId().replace(/:/g, "");
  const grad1 = `lgS1-${uid}`;
  const grad2 = `lgS2-${uid}`;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="animate-lg-drift bg-vitta absolute -top-24 -left-20 h-96 w-96 rounded-full opacity-20 blur-3xl" />
      <div className="animate-lg-drift-delayed bg-kleanly absolute -right-20 -bottom-28 h-80 w-80 rounded-full opacity-15 blur-3xl" />
      <svg
        viewBox="0 0 600 800"
        preserveAspectRatio="xMidYMid slice"
        focusable="false"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-60"
      >
        <defs>
          <linearGradient id={grad1} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--vitta)" stopOpacity=".22" />
            <stop offset="1" stopColor="var(--vitta)" stopOpacity=".04" />
          </linearGradient>
          <linearGradient id={grad2} x1="1" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="var(--kleanly)" stopOpacity=".24" />
            <stop offset="1" stopColor="var(--kleanly)" stopOpacity=".04" />
          </linearGradient>
        </defs>
        <g>
          <rect
            x="-90"
            y="-70"
            width="270"
            height="270"
            rx="64"
            transform="rotate(14 45 65)"
            fill={`url(#${grad1})`}
          />
        </g>
        <g>
          <rect
            x="420"
            y="610"
            width="260"
            height="260"
            rx="64"
            transform="rotate(-12 550 740)"
            fill={`url(#${grad2})`}
          />
        </g>
        <g>
          <circle
            cx="520"
            cy="120"
            r="46"
            fill="none"
            stroke="var(--vitta)"
            strokeOpacity=".28"
            strokeWidth="1.5"
          />
        </g>
        <g
          fill="var(--primary)"
          fillOpacity=".25"
          transform="translate(40 640)"
        >
          {[0, 16, 32, 48].map((x) =>
            [0, 16, 32, 48, 64].map((y) => (
              <circle key={`${x}-${y}`} cx={x} cy={y} r="2" />
            )),
          )}
        </g>
      </svg>
    </div>
  );
}
