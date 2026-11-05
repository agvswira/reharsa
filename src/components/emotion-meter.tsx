// Meter emosi 0-10. Sebelas ruas dipilih supaya setiap kenaikan atau
// penurunan satu poin terlihat jelas tanpa membaca angka. Ini motif
// identitas Reharsa: muncul di halaman depan, layar latihan, dan transkrip.

export function emotionLabel(value: number) {
  if (value <= 3) return "tenang";
  if (value <= 6) return "kesal";
  return "marah";
}

export function EmotionMeter({
  value,
  reason,
  who,
  compact = false,
}: {
  value: number;
  reason?: string;
  who: string;
  // Versi ringkas untuk bilah atas di HP: tanpa alasan, ruas lebih tipis.
  compact?: boolean;
}) {
  return (
    <div className={compact ? "space-y-1.5" : "space-y-2"}>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm text-muted">Emosi {who}</p>
        <p className="font-bold tabular-nums">
          {value}/10 · {emotionLabel(value)}
        </p>
      </div>
      <div
        role="meter"
        aria-label={`Emosi ${who}`}
        aria-valuemin={0}
        aria-valuemax={10}
        aria-valuenow={value}
        aria-valuetext={`${value} dari 10, ${emotionLabel(value)}`}
        className="grid grid-cols-11 gap-1"
      >
        {Array.from({ length: 11 }, (_, i) => (
          <span
            key={i}
            className={`${compact ? "h-1.5" : "h-2.5"} rounded-sm transition-colors duration-300 ${
              i <= value ? (value >= 7 ? "bg-alert" : "bg-ink") : "bg-line"
            }`}
          />
        ))}
      </div>
      {reason && !compact ? (
        <p className="text-sm text-muted">{reason}</p>
      ) : null}
    </div>
  );
}
