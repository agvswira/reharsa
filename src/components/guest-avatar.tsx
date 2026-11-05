import Image from "next/image";
import { GUEST_PHOTOS } from "@/lib/guest-photos";
import { initials } from "@/lib/progress";
import type { Scenario } from "@/lib/scenarios";

const SIZE = { sm: 36, md: 44, lg: 64 } as const;

// Foto tamu dalam lingkaran. Nama tamu selalu tertulis di sebelahnya, jadi
// foto ini dekoratif (alt kosong). Bila foto tidak ada, inisial jadi
// cadangannya.
export function GuestAvatar({
  scenario,
  size = "md",
}: {
  scenario: Scenario;
  size?: keyof typeof SIZE;
}) {
  const px = SIZE[size];
  const photo = GUEST_PHOTOS[scenario.id];
  if (photo) {
    return (
      <Image
        src={photo.src}
        alt=""
        width={px}
        height={px}
        className="shrink-0 rounded-full border border-line-2 bg-accent-soft object-cover"
        style={{ width: px, height: px }}
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className="grid shrink-0 place-items-center rounded-full border border-line-2 bg-accent-soft font-display text-sm font-semibold text-ink"
      style={{ width: px, height: px }}
    >
      {initials(scenario.guest.name)}
    </span>
  );
}
