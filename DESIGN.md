# Arah desain Reharsa

Diturunkan dari landing page [OpenLC](https://github.com/zghanw/openlc) (`web/app/landing.css`), disesuaikan untuk Reharsa dan dibuat lebih ringan.

Dial: ENERGY 2 / RHYTHM 2 / MOTION 2.

## Karakter

Monokrom gelap: latar hitam, teks putih keperakan, kartu hampir hitam yang mengilap tipis, garis putih tipis, tombol pil putih. Putih adalah satu-satunya warna. Kesannya tenang, mahal, dan fokus, sehingga percakapan dan skor menjadi satu-satunya hal yang menonjol.

## Token

| Token | Nilai | Pakai untuk | Kontras |
| --- | --- | --- | --- |
| `--bg` | `#000000` ke `#060606` (gradasi vertikal) | Latar halaman | |
| `--card` | `#0d0d0f` ke `#08080a` | Kartu, panel | |
| `--text` | `#f4f4f5` | Teks utama, tombol utama | 19.1:1 |
| `--soft` | `#d4d4d8` | Teks sekunder yang tetap penting | 14.2:1 |
| `--muted` | `#a1a1aa` | Keterangan, label | 7.6:1 di kartu |
| `--hair` | `rgba(255,255,255,.08)` | Garis pemisah, tepi kartu | dekorasi |
| `--hair-2` | `rgba(255,255,255,.14)` | Tepi tombol hantu | |
| `--edge` | `rgba(255,255,255,.42)` | Tepi kontrol input (minimal 3:1) | |
| `--alert` | `#f87171` | Hanya status: emosi tamu tinggi, skor rendah, error. Selalu disertai teks | 7.6:1 |

Tambahan Reharsa dibanding referensi: `--alert`, karena meter emosi dan error butuh warna status. Tidak ada warna aksen lain.

### Tema terang (pilihan pemilik)

Gelap adalah bawaan. Tema terang tetap tersedia lewat tombol di header, sebagai kebalikan monokrom dari tema gelap:

| Token | Nilai | Kontras |
| --- | --- | --- |
| `--bg` | `#fafafa` ke `#f4f4f5` | |
| `--card` | `#ffffff` | |
| `--text` | `#0a0a0b` | 19.0:1 |
| `--soft` | `#27272a` | 14.3:1 |
| `--muted` | `#52525b` | 7.4:1 |
| `--hair` / `--hair-2` | `rgba(0,0,0,.08)` / `rgba(0,0,0,.14)` | dekorasi |
| `--edge` | `rgba(0,0,0,.45)` | minimal 3:1 |
| `--alert` | `#b91c1c` | 6.2:1 |

Di tema terang, tombol utama menjadi pil hitam dengan teks putih.

## Keputusan pemilik atas pola yang bentrok aturan anti-slop

| Pola di referensi | Keputusan |
| --- | --- |
| Hanya tema gelap | Gelap sebagai bawaan, tema terang tetap ada |
| Bento grid untuk jaminan | Diganti daftar dua kolom |
| Ikon Lucide di deretan fakta | Dihapus, fakta ditandai titik kecil |
| Panah di banyak tombol | Dihapus |
| Ikon di saklar tema | Pengecualian: matahari dan bulan dipakai di saklar tema gelap/terang, karena tanpa simbol saklar tidak terbaca sebagai pengatur tema. Ikon tidak dipakai di tempat lain. |

## Tipografi

| Peran | Font | Gaya |
| --- | --- | --- |
| Judul raksasa (hero, penutup) | Bricolage Grotesque | 600-620, tracking -0.03em, line-height 1.04, `clamp(2.4rem, 7vw, 5.5rem)`, satu kalimat per baris |
| Judul bagian (h2) | Bricolage Grotesque | 600, tracking -0.028em, `clamp(2rem, 1.3rem + 2.5vw, 3.5rem)` |
| Judul kartu (h3) | Mona Sans | 600, tracking -0.014em |
| Teks | Mona Sans | 16px, line-height 1.6 |
| Lede | Mona Sans | 16-18px, warna `--muted`, maksimal 60ch |

## Bentuk

- Tombol utama: pil putih (`#f4f4f5`) dengan teks hitam, tinggi 50px.
- Tombol hantu: pil transparan dengan tepi `--hair-2`.
- Kartu: radius 18px, tepi `--hair`, sorotan tipis di tepi atas (`inset 0 1px 0 rgba(255,255,255,.06)`).
- Pil hanya untuk tombol dan chip status. Kartu, input, dan panel tidak berbentuk pil.

## Tata letak halaman depan

1. Header menempel, navigasi pil kecil, satu tombol aksi.
2. Hero di tengah: judul raksasa dua baris, lede, dua tombol, lalu kartu tamu sebagai pusat visual dengan sorot cahaya putih di belakangnya, lalu deretan fakta.
3. Perbandingan "dua cara" berdampingan.
4. Bukti: teks di kiri, kartu contoh rapor di kanan.
5. Langkah bernomor dengan mini-visual.
6. Daftar situasi (fungsional).
7. Prinsip.
8. Penutup: judul raksasa dan tombol.

## Gerak

- Elemen muncul dengan naik dan memudar, tanpa efek blur.
- Meter emosi contoh turun dari 8 ke 3 sekali saat halaman dibuka.
- Semua gerak mati saat `prefers-reduced-motion: reduce`.

## Yang sengaja tidak dibawa dari referensi (supaya ringan)

| Di referensi | Pengganti di Reharsa | Alasan |
| --- | --- | --- |
| Library `motion` (framer) | Animasi CSS | Tanpa JavaScript tambahan |
| Kanvas terowongan animasi | Sorot cahaya dari gradasi CSS, tanpa `filter: blur` | Tidak membebani GPU dan baterai HP |
| Efek blur saat elemen muncul | Naik dan memudar | `filter: blur` mahal untuk digambar |
| Header dengan `backdrop-filter` | Header gelap solid | Sama alasannya |
| Halaman depan sebagai komponen klien | Komponen server | HTML langsung jadi, tanpa hidrasi |

## Aksesibilitas

- Kontras teks minimal 4.5:1, komponen dan fokus minimal 3:1.
- Fokus: garis putih 2px dengan jarak 3px.
- Semua kontrol elemen asli, target sentuh minimal 44px.
- Jawaban tamu diumumkan ke pembaca layar; teks bahasa Inggris diberi `lang="en"`.
