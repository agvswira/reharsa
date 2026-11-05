// Meter emosi 0-10. Sebelas ruas dipilih supaya setiap kenaikan atau
// penurunan satu poin terlihat jelas tanpa membaca angka.

export function emotionLabel(value: number) {
  if (value <= 3) return "tenang";
  if (value <= 6) return "kesal";
  return "marah";
}

export function EmotionMeter({
  value,
  reason,
  who,
}: {
  value: number;
  reason?: string;
  who: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm text-muted">Emosi {who}</p>
        <p className="font-bold tabular-nums" aria-live="polite">
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
            className={`h-2.5 rounded-sm transition-colors duration-300 ${
              i <= value
                ? value >= 7
                  ? "bg-alert"
                  : "bg-ink"
                : "bg-line"
            }`}
          />
        ))}
      </div>
      {reason ? <p className="text-sm text-muted">{reason}</p> : null}
    </div>
  );
}
