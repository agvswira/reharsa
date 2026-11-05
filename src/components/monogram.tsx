import { initials } from "@/lib/progress";

// Inisial tamu dalam lingkaran: placeholder jujur pengganti foto profil,
// karena semua tamu fiktif dan tidak punya wajah.
export function Monogram({
  name,
  size = "md",
}: {
  name: string;
  size?: "md" | "lg";
}) {
  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center rounded-full border border-line-2 bg-accent-soft font-display font-semibold text-ink ${
        size === "lg" ? "size-16 text-xl" : "size-11 text-sm"
      }`}
    >
      {initials(name)}
    </span>
  );
}
