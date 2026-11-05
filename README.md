# Reharsa

Simulator tamu berbasis AI untuk calon pekerja pariwisata Bali. Siswa berbicara dengan suara kepada tamu hotel virtual yang punya kebangsaan, aksen, dan emosi, lalu menerima rapor pelayanan berbasis rubrik kompetensi dengan umpan balik dalam Bahasa Indonesia.

Karya untuk AI Web Innovation Challenge Bali DigiFest 2026, subtema Education & Smart Information Systems.

## Problem & Target User

Siswa SMK pariwisata dan mahasiswa D3/D4 pariwisata jarang punya kesempatan berlatih bicara dengan tamu asing sungguhan, padahal kemampuan itu menentukan kelulusan magang, uji kompetensi, dan wawancara kerja (termasuk kapal pesiar). Role-play di kelas biasanya dilakukan antarteman, dan satu guru tidak bisa memberi umpan balik rinci ke setiap siswa.

Pengguna: siswa SMK dan mahasiswa D3/D4 pariwisata/perhotelan.

## Key Features

Sudah berfungsi:

- Tiga situasi latihan: AC rusak saat Nyepi (tamu Australia), check-in dan aturan pura (tamu India), wawancara kru kapal pesiar (pewawancara Inggris).
- Suasana awal tamu bisa dipilih: sabar, kesal, atau marah.
- Percakapan suara dua arah: rekam dari mikrofon, ditranskripsi, tamu AI menjawab dengan suara beraksen.
- Meter emosi tamu 0-10 yang berubah setiap giliran, beserta alasannya.
- Mode ketik sebagai cadangan bila mikrofon atau layanan suara tidak tersedia.
- Rapor: skor 1-4 per kriteria rubrik, kutipan ucapan siswa sebagai bukti, tingkat keyakinan penilai, contoh kalimat yang lebih baik, dan skor kejelasan pengucapan per kata.
- Tema terang dan gelap.

Belum dibuat: akun siswa dan riwayat latihan, skrip evaluasi otomatis (`npm run eval`).

## Tech Stack

| Bagian | Pilihan |
| --- | --- |
| Frontend | Next.js 16 (App Router), React 19, Tailwind CSS 4 |
| Backend | Next.js Route Handlers (Node.js) |
| Validasi | Zod |
| Database | Belum ada (rencana: Supabase Free) |
| Hosting | Vercel Hobby (rencana) |

## AI Implementation

| Komponen | Layanan / model | Input → output |
| --- | --- | --- |
| Speech-to-Text | `STT_*`, contoh Groq Whisper `whisper-large-v3-turbo` (cadangan: pengenalan suara browser) | Audio WAV 16 kHz → teks |
| Agen Tamu | Rantai `GUEST_LLM_ORDER`, contoh Groq Qwen 3.8 27B → provider custom | Riwayat percakapan + emosi saat ini → `{reply, emotion, emotion_reason, resolved}` |
| Text-to-Speech | Azure Neural TTS F0 (cadangan: suara browser) | Teks tamu + emosi → MP3 beraksen (en-AU, en-IN, en-GB) |
| Pronunciation Assessment | Azure AI Speech F0 | Audio + teks → skor akurasi, kelancaran, skor per kata |
| Agen Penilai | Rantai `JUDGE_LLM_ORDER`, contoh provider custom → Groq | Transkrip + rubrik → skor 1-4, kutipan bukti, keyakinan per kriteria |
| Agen Coach | Rantai `JUDGE_LLM_ORDER` | Transkrip → ringkasan dan contoh kalimat lebih baik |

Semua LLM dipanggil lewat endpoint kompatibel OpenAI (`{BASE_URL}/chat/completions`), jadi endpoint, model, dan urutan provider diatur sepenuhnya lewat `.env.local` tanpa mengubah kode (lihat Konfigurasi). Provider yang membalas 429 atau 5xx dilewati sementara (sesuai header `retry-after`, default 60 detik) dan permintaan langsung pindah ke provider berikutnya.

Kode utama:

- Prompt dan aturan tiap agen: [`src/lib/server/agents.ts`](src/lib/server/agents.ts)
- Pemanggilan LLM, validasi skema, dan urutan cadangan: [`src/lib/server/llm.ts`](src/lib/server/llm.ts)
- Speech-to-Text, TTS, Pronunciation Assessment: [`src/lib/server/speech.ts`](src/lib/server/speech.ts)
- Skenario, fakta hotel, rubrik: [`src/lib/scenarios.ts`](src/lib/scenarios.ts)

Keputusan desain:

- Agen Tamu dan Agen Penilai dipisah supaya skor tidak dipengaruhi jalannya role-play.
- Agen Tamu hanya boleh memakai fakta dari skenario (grounding), sehingga tidak mengarang harga atau layanan.
- Semua output LLM diminta dalam JSON dan divalidasi dengan Zod. Output yang tidak valid dicoba ulang sekali, lalu pindah ke provider cadangan.
- Penilai diminta menilai kejelasan dan kesopanan, bukan kemiripan dengan penutur asli.

Penanganan gagal: Whisper gagal → teks dari pengenalan suara browser; mikrofon ditolak → pesan jelas dan pilihan mengetik; LLM gagal atau kena limit → provider berikutnya di rantai, lalu pesan error dengan tombol "Kirim ulang"; Azure TTS tidak tersedia → suara browser.

## Architecture / Data Flow

```
Per giliran:
Browser (rekam, ubah ke WAV 16 kHz, teks berjalan dari browser) → /api/stt (Whisper) → teks
teks + riwayat → /api/guest (Agen Tamu) → jawaban + emosi → /api/tts (Azure) → suara
audio + teks → /api/pronunciation (Azure) → skor pengucapan (berjalan di latar)

Akhir sesi:
transkrip → /api/evaluate → Agen Penilai + Agen Coach (paralel) → rapor
```

Tidak ada database pada versi ini. Transkrip hanya ada di memori browser selama sesi; rekaman suara tidak disimpan.

## Installation / Run Instructions

Butuh Node.js 20 atau lebih baru.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Isi key di `.env.local`, lalu buka http://localhost:3000. Aplikasi tetap terbuka tanpa key, tetapi menampilkan layanan mana yang belum aktif.

### Konfigurasi

Kode tidak menyimpan URL, model, atau urutan bawaan; semuanya dibaca dari `.env.local`.

| Variabel | Fungsi |
| --- | --- |
| `GUEST_LLM_ORDER`, `JUDGE_LLM_ORDER` | Urutan cadangan per agen, nama provider dipisah koma |
| `{NAMA}_BASE_URL`, `{NAMA}_MODEL`, `{NAMA}_API_KEY` | Satu provider dengan endpoint kompatibel OpenAI. Provider tanpa key dilewati |
| `{NAMA}_JSON_MODE=false` | Opsional, untuk provider yang menolak `response_format` |
| `STT_BASE_URL`, `STT_MODEL`, `STT_API_KEY` | Speech-to-Text (`/audio/transcriptions`) |
| `AZURE_SPEECH_REGION`, `AZURE_SPEECH_KEY` | Suara tamu dan skor pengucapan |

Menambah provider, misalnya OpenRouter: tulis `OPENROUTER_BASE_URL`, `OPENROUTER_MODEL`, `OPENROUTER_API_KEY`, lalu sebut `OPENROUTER` di urutan agen.

## Deployment URL

[ISI URL deployment]

## Demo Account

Tidak perlu login pada versi ini.

## Known Limitations

- Batas pemakaian per IP disimpan di memori server, jadi di serverless angkanya per instance.
- Kuota tier gratis (Groq, Azure F0) dan provider custom bisa habis saat banyak pengguna.
- Skor pengucapan Azure memakai acuan en-US; ditampilkan sebagai kejelasan kata dan tidak dihitung ke poin rapor.
- Skor rapor adalah alat latihan, bukan sertifikasi.
- Belum ada akun siswa dan riwayat latihan.

## Third-party Resources / Credits

- Next.js, React, Tailwind CSS, Zod (lisensi MIT)
- Font Atkinson Hyperlegible Next (SIL Open Font License)
- Groq API, Azure AI Speech, dan provider custom yang dikonfigurasi tim (layanan pihak ketiga)
- Hotel Puri Sekar dan semua tokoh tamu adalah fiktif, dibuat tim untuk latihan.

## AI Coding Assistant

[ISI: alat bantu AI yang dipakai saat coding dan untuk apa. Wajib diungkapkan sesuai panduan lomba.]

## Team Members

- Komang Agus Wira Adnyana: [ISI peran]
- I Made Megadhana: [ISI peran]
