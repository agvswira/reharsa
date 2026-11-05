// Siluet candi bentar (gerbang terbelah) yang disederhanakan. Gerbang ini
// berdiri di pintu masuk hampir setiap hotel dan resor di Bali, tempat tamu
// pertama kali disambut; di Reharsa ia menandai "masuk ke layanan".
// Dekoratif: aria-hidden, warna mengikuti tema lewat currentColor.

// Profil sisi luar separuh kiri, dari bawah ke atas: [y atas tingkat, x luar].
// Sisi dalam lurus di x=400. Pola lebar-sempit berselang meniru atap
// bertingkat (lebar = bibir tingkat, sempit = badan tingkat).
const TIERS: [number, number][] = [
  [650, 110], // alas
  [620, 130],
  [560, 150], // badan
  [400, 150],
  [370, 125], // bibir atas badan
  [330, 175],
  [315, 160],
  [275, 205],
  [262, 190],
  [225, 235],
  [213, 222],
  [178, 265],
  [168, 252],
  [135, 295],
  [126, 285],
  [95, 325],
  [70, 350],
  [45, 370],
  [20, 385],
  [0, 393],
];

// Naik ke puncak tiap tingkat, lalu bergeser ke lebar tingkat berikutnya.
function halfPath() {
  let d = `M400 700 L${TIERS[0][1]} 700`;
  TIERS.forEach(([y, x], i) => {
    const next = TIERS[i + 1]?.[1] ?? 400;
    d += ` L${x} ${y} L${next} ${y}`;
  });
  return `${d} Z`;
}

const HALF = halfPath();
// Garis pahatan di badan gerbang (bagian dari motif, bukan pemisah).
const LEDGES = "M150 560 L400 560 M150 500 L400 500 M150 440 L400 440";

export function CandiBentar({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1400 700"
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="xMidYMax meet"
      className={className}
    >
      <g fill="currentColor" fillOpacity="0.07" stroke="currentColor" strokeOpacity="0.14" strokeWidth="1.5">
        <path d={HALF} />
        <path d={HALF} transform="translate(1400 0) scale(-1 1)" />
      </g>
      <g fill="none" stroke="currentColor" strokeOpacity="0.12" strokeWidth="1.5">
        <path d={LEDGES} />
        <path d={LEDGES} transform="translate(1400 0) scale(-1 1)" />
      </g>
    </svg>
  );
}
