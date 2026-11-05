# Arah desain Reharsa

Diturunkan dari landing page [OpenLC](https://github.com/zghanw/openlc) (`web/app/landing.css`), disesuaikan untuk Reharsa dan dibuat lebih ringan.

Dial: ENERGY 2 / RHYTHM 2 / MOTION 2.

## Karakter

Monokrom hangat bernuansa Bali: struktur dan ketenangan dari OpenLC, tetapi bahannya diambil dari bangunan hotel dan pura di Bali. Tema gelap adalah batu candi (hitam vulkanik yang hangat), tema terang adalah batu paras (krem). Tidak ada warna aksen untuk UI; nuansa Bali datang dari bahan, satu motif gerbang, dan bahasa sapaan, bukan dari ornamen yang ditebar.

## Nuansa Bali (pilihan pemilik)

| Unsur | Di mana | Alasan |
| --- | --- | --- |
| Palet batu candi dan paras | Seluruh aplikasi | Bahan bangunan khas hotel dan pura Bali; tetap monokrom, jadi bersih dan modern |
| Cahaya hangat (`--lamp`) | Hanya di balik kartu percakapan di hero | Kesan cahaya sore; satu-satunya warna hangat non-status selain pusat bunga jepun |
| Sapaan "Om Swastiastu" | Judul halaman Latihan | Salam yang dipakai di ruang publik Bali, termasuk hotel |
| Bunga jepun (frangipani) | Saat tamu puas (pesan selesai, rapor dengan emosi akhir 3 ke bawah), keadaan kosong riwayat | Simbol sambutan di hotel Bali; muncul hanya di momen yang berarti, bukan hiasan. Kelopak putih (`--petal`), pusat kuning (`--bloom`) |
| Foto candi bentar di pantai | Hanya bagian penutup halaman depan, dengan lapisan gelap 0.68 | Gerbang yang sama dengan motif hero, kini foto sungguhan; satu-satunya foto tempat. Kontras teks terburuk 6.7:1 |
| Hotel Puri Sekar, Ubud | Kepala halaman latihan, pengantar Latihan, kartu tamu di rapor | Rasa tempat: siswa sedang bertugas di hotel, bukan mengerjakan soal |
| Panggung suara di layar latihan | Percakapan berlangsung | Seperti panggilan dengan tamu: foto tamu di tengah, kalimat yang sedang diucapkan besar, tombol bicara bulat di bawah. Panel selalu gelap (token ditimpa di `.stage`) sebagai satu titik fokus. Cincin di sekitar foto menunjukkan status nyata: riak hangat saat tamu bicara, mengikuti volume mikrofon saat kamu bicara, bernapas saat tamu berpikir; diam bila tidak ada apa-apa. Pengganti "AI orb" bercahaya di referensi, yang generik |
| Rapor sebagai kartu komentar tamu | Kepala rapor | Menampilkan tamu dan perasaannya di akhir (data emosi asli); skor tetap ditandai sebagai rapor layanan dari agen penilai |

Yang sengaja tidak dipakai: kain poleng dan simbol sakral (bermakna religius), pola ukiran atau batik sebagai latar berulang, dan foto stok pura atau sawah di hero. Ukiran patra punggel sempat dicoba lalu dibatalkan karena versi sederhananya terbaca sebagai sulur generik. Siluet candi bentar gambar sendiri di hero juga dibatalkan: tanpa ornamen karang yang menjorok, bentuknya terbaca sebagai piramida berundak. Candi bentar cukup hadir lewat foto asli di bagian penutup.

## Token

Tabel pertama adalah tema gelap (batu candi), beserta peran setiap token. Nilai tema terang, yang menjadi bawaan, ada di tabel berikutnya.

| Token | Nilai | Pakai untuk | Kontras |
| --- | --- | --- | --- |
| `--bg` | `#0d0b09` ke `#110e0b` (gradasi vertikal) | Latar halaman, batu candi | |
| `--card` | `#17130f` ke `#120f0c` | Kartu, panel | |
| `--text` | `#f4efe6` | Teks utama, tombol utama | 17.2:1 |
| `--soft` | `#d9d1c4` | Teks sekunder yang tetap penting | 12.2:1 di kartu |
| `--muted` | `#a69d90` | Keterangan, label | 6.9:1 di kartu |
| `--hair` | `rgb(244 239 230 / .08)` | Tepi kartu | dekorasi |
| `--hair-2` | `rgb(244 239 230 / .14)` | Tepi tombol hantu | |
| `--edge` | `rgb(244 239 230 / .42)` | Tepi kontrol input (minimal 3:1) | |
| `--lamp` | `rgb(240 190 120 / .16)` | Cahaya di balik kartu hero, tidak di tempat lain | dekorasi |
| `--alert` | `#ef8a6f` (merah bata) | Status merah: emosi tamu tinggi, skor "perlu dilatih" (di bawah 50%), error. Selalu disertai teks. Teks di atasnya memakai `--alert-ink` `#0d0b09` (8.0:1) | 7.5:1 di kartu |
| `--warn` | `#e8b552` (oker) | Tingkat skor "cukup" (50 sampai 74%). Selalu disertai teks | 9.8:1 di kartu |
| `--good` | `#8cc78f` (hijau daun) | Tingkat skor "kuat" (75% ke atas). Selalu disertai teks | 9.4:1 di kartu |
| `--photo-scrim`, `--photo-ink` | `rgb(13 11 9 / .68)`, `#f4efe6` | Panel foto penutup, sama di kedua tema | teks terburuk 6.7:1 |

Warna tingkat sengaja dihangatkan dan diredam (bata, oker, hijau daun) supaya tidak terasa seperti warna bawaan Tailwind di atas palet batu. Bar tingkat minimal 3.8:1 terhadap ruas kosong.

Tambahan Reharsa dibanding referensi: tiga warna tingkat (`--alert`, `--warn`, `--good`). Warna ini hanya dipakai di bar skor, grafik riwayat, dan meter emosi, tidak pernah sebagai hiasan atau aksen. Tombol, teks, dan tepi tetap monokrom.

### Tema terang (bawaan)

Terang (batu paras) adalah bawaan sejak nuansa Bali diterapkan, karena krem paras paling terasa hangat dan Bali. Tema gelap (batu candi) tetap tersedia lewat saklar di header, dan pilihan pengguna diingat:

| Token | Nilai | Kontras |
| --- | --- | --- |
| `--bg` | `#f5efe4` ke `#ede5d6` | |
| `--card` | `#fbf8f1` | |
| `--text` | `#1c1814` | 15.4:1 |
| `--soft` | `#3b342c` | |
| `--muted` | `#5e554a` | 5.8:1 sampai 6.9:1 |
| `--hair` / `--hair-2` | `rgb(28 24 20 / .08)` / `rgb(28 24 20 / .14)` | dekorasi |
| `--edge` | `rgb(28 24 20 / .45)` | minimal 3:1 |
| `--lamp` | `rgb(200 120 40 / .12)` | dekorasi |
| `--alert` | `#b13a24`, teks di atasnya `#fbf8f1` (5.7:1) | 5.2:1 sampai 5.7:1 |
| `--warn` | `#9a5b0c` | 5.1:1 |
| `--good` | `#3d7a3f` | 4.5:1 sampai 4.9:1 |

Di tema terang, tombol utama menjadi pil gelap hangat dengan teks krem.

## Keputusan pemilik atas pola yang bentrok aturan anti-slop

| Pola di referensi | Keputusan |
| --- | --- |
| Hanya tema gelap | Awalnya gelap sebagai bawaan; sejak nuansa Bali, terang (paras) menjadi bawaan dan gelap tetap ada |
| Bento grid untuk jaminan | Diganti daftar dua kolom |
| Ikon Lucide di deretan fakta | Dihapus, fakta ditandai titik kecil |
| Panah di banyak tombol | Dihapus |
| Satu warna status saja | Pemilik minta bar skor berwarna menurut tingkat: merah, kuning, hijau. Dipakai hanya untuk tingkat skor, selalu dengan label teks. |
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
