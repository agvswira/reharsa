// Foto tamu, per id skenario. Semua dari Unsplash dengan Unsplash License
// (bebas dipakai, atribusi tidak wajib tapi kami cantumkan). Orang di foto
// adalah model, bukan tokoh yang diperankan; semua tamu di Reharsa fiktif.
// File di public/guests/, 320x320, dipotong ke wajah.

export type GuestPhoto = { src: string; by: string; url: string };

export const GUEST_PHOTOS: Record<string, GuestPhoto> = {
  "nyepi-ac-rusak": {
    src: "/guests/mark-henderson.jpg",
    by: "Sophie Paterson",
    url: "https://unsplash.com/photos/LE9Y6zXxHDw",
  },
  "checkin-pura": {
    src: "/guests/priya-raman.jpg",
    by: "Nandu Vasudevan",
    url: "https://unsplash.com/photos/IOkcmoOFyRs",
  },
  "wawancara-kapal-pesiar": {
    src: "/guests/sarah-whitfield.jpg",
    by: "Olga Zhuravleva",
    url: "https://unsplash.com/photos/6fAlS0h9vU8",
  },
  "reservasi-telepon": {
    src: "/guests/kim-ji-woo.jpg",
    by: "panitan punpuang",
    url: "https://unsplash.com/photos/OuxJHYeUYpk",
  },
  "checkout-tagihan": {
    src: "/guests/chen-wei.jpg",
    by: "Let hho",
    url: "https://unsplash.com/photos/cZPouvekO-I",
  },
  "concierge-transport": {
    src: "/guests/tom-harris.jpg",
    by: "Vicky Hladynets",
    url: "https://unsplash.com/photos/_gDoyVv5F4c",
  },
  "housekeeping-kamar": {
    src: "/guests/camille-laurent.jpg",
    by: "Zoran Borojevic",
    url: "https://unsplash.com/photos/4BG2yKyCaWg",
  },
  "restoran-alergi": {
    src: "/guests/emma-clarke.jpg",
    by: "Jake Nackos",
    url: "https://unsplash.com/photos/IF9TK5Uy-KI",
  },
  overbooking: {
    src: "/guests/lukas-becker.jpg",
    by: "Beatriz Cattel",
    url: "https://unsplash.com/photos/126jj94OSY8",
  },
  "abu-vulkanik": {
    src: "/guests/jessica-walsh.jpg",
    by: "Brooke Balentine",
    url: "https://unsplash.com/photos/xSEFkIAopxA",
  },
  "tamu-sakit": {
    src: "/guests/arjun-mehta.jpg",
    by: "DICSON",
    url: "https://unsplash.com/photos/vAXmZOtLfo0",
  },
};
