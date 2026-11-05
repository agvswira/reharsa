// Logo Reharsa: candi bentar yang tersusun dari batang suara, berdiri di alas
// dengan anak tangga, dan matahari di celah gerbang. Maknanya: suaramu adalah
// gerbang menuju layanan di Bali. Bentuk mengikuti file desain pemilik
// (public/brand/reharsa-mark-*.svg); batang dan alas memakai currentColor
// supaya ikut tema, matahari tetap kuning.

const SUN = "#E5B14C";

// Batang: puncak membulat (suara), dasar rata di alas (bangunan).
const BARS = [
  "M8 60.5C8 58.567 9.567 57 11.5 57S15 58.567 15 60.5V84H8V60.5Z",
  "M17 44.5C17 42.567 18.567 41 20.5 41S24 42.567 24 44.5V84H17V44.5Z",
  "M26 27.5C26 25.567 27.567 24 29.5 24S33 25.567 33 27.5V84H26V27.5Z",
  "M35 10.5C35 8.567 36.567 7 38.5 7S42 8.567 42 10.5V84H35V10.5Z",
  "M68 10.5C68 8.567 69.567 7 71.5 7S75 8.567 75 10.5V84H68V10.5Z",
  "M77 27.5C77 25.567 78.567 24 80.5 24S84 25.567 84 27.5V84H77V27.5Z",
  "M86 44.5C86 42.567 87.567 41 89.5 41S93 42.567 93 44.5V84H86V44.5Z",
  "M95 60.5C95 58.567 96.567 57 98.5 57S102 58.567 102 60.5V84H95V60.5Z",
];

export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 110 99"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <g fill="currentColor">
        <rect x="3" y="87" width="104" height="7" rx="3.5" />
        <rect x="45" y="77" width="20" height="7" />
        {BARS.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      <circle cx="55" cy="44" r="10" fill={SUN} />
    </svg>
  );
}

/** Logo lengkap: tanda + nama. Nama tetap teks asli supaya terbaca mesin. */
export function Logo({
  size = "md",
  className = "",
}: {
  size?: "md" | "lg";
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark className={size === "lg" ? "h-8 w-auto" : "h-7 w-auto"} />
      <span
        className={`font-display font-semibold tracking-[-0.03em] text-ink ${
          size === "lg" ? "text-2xl" : "text-xl"
        }`}
      >
        Reharsa
      </span>
    </span>
  );
}
