# Arah desain Reharsa

Reharsa adalah alat latihan bicara untuk mahasiswa pariwisata. Desainnya meminjam suasana meja front office hotel yang rapi: tenang, jelas, dan sopan, supaya perhatian siswa tetap pada percakapan.

Dial: ENERGY 2 / RHYTHM 2 / MOTION 1.

## Keputusan

| Elemen | Pilihan | Alasan |
| --- | --- | --- |
| Warna dasar | Kertas krem `#f7f5f0`, tinta `#1f2328` | Nyaman dibaca lama, tidak silau saat membaca transkrip |
| Aksen | Hijau tua `#1d6b57`, hanya untuk aksi utama (bicara, mulai) dan fokus keyboard | Satu titik perhatian per layar |
| Status | Merah bata `#a63d2a` hanya untuk emosi tamu tinggi, skor rendah, dan error, selalu disertai teks | Warna tidak pernah jadi satu-satunya penanda |
| Judul | Fraunces (serif) | Nuansa kartu registrasi hotel; membedakan identitas dari aplikasi chat biasa |
| Teks | Atkinson Hyperlegible Next | Huruf mudah dibedakan untuk pembaca transkrip dan umpan balik |
| Motif | Meter emosi 11 ruas dan kartu tamu | Muncul di halaman depan, layar latihan, dan transkrip |
| Gerak | Hanya transisi meter emosi dan indikator volume mikrofon | Keduanya memberi informasi; mati saat `prefers-reduced-motion` |

## Tata letak

- Layar latihan, desktop: kartu tamu, meter emosi, tujuan, dan tombol selesai diam di kolom kiri; transkrip di tengah; tombol bicara selalu terlihat di bawah.
- Layar latihan, HP: meter emosi ringkas menempel di atas, tombol bicara menempel di bawah.
- Rapor: total poin dan satu kriteria "fokus latihan berikutnya" di atas, rincian di bawah.

## Aksesibilitas

- Kontras teks minimal 4.5:1 di tema terang dan gelap; komponen dan fokus minimal 3:1.
- Semua kontrol elemen asli (`button`, `a`, `label`), target sentuh minimal 44 px, fokus terlihat.
- Tautan "Langsung ke konten" di awal halaman.
- Jawaban tamu diumumkan ke pembaca layar; teks bahasa Inggris diberi `lang="en"`.
- Saat rapor muncul, fokus dipindah ke judul rapor.
