// Timeline dua jalur di halaman depan, diadaptasi dari "credit timeline"
// referensi OpenLC. Versi ini komponen server tanpa JavaScript: garis tengah
// terisi dan baris menyala lewat animasi CSS yang mengikuti gulir
// (lihat .tl-* di globals.css). Semua isi adalah contoh alur.

type Step = {
  when: string;
  classroom?: { title: string };
  waiting?: string;
  reharsa?: { title: string; emotion: number; turn: string };
  report?: string;
};

const STEPS: Step[] = [
  {
    when: "Menit 0",
    classroom: {
      title: "Teman sekelas pura-pura jadi tamu.",
    },
    reharsa: {
      title: "Mark membuka dengan marah.",
      emotion: 8,
      turn: "Tamu bicara",
    },
  },
  {
    when: "Menit 1",
    waiting: "Belum ada umpan balik.",
    reharsa: {
      title: "Kamu minta maaf dan jelaskan aturan Nyepi.",
      emotion: 6,
      turn: "Giliran 1",
    },
  },
  {
    when: "Menit 3",
    waiting: "Masih belum ada.",
    reharsa: {
      title: "Kamu tawarkan teknisi dalam 15 menit.",
      emotion: 3,
      turn: "Giliran 2",
    },
  },
  {
    when: "Menit 5",
    classroom: {
      title: "Guru melihat sekilas.",
    },
    report:
      "Rapor siap, lengkap dengan kalimat yang lebih baik.",
  },
  {
    when: "Setelah kelas",
    classroom: {
      title: "Catatan lisan, lalu terlupa.",
    },
  },
];

export function PracticeTimeline() {
  return (
    <div className="tl">
      <div className="tl-lanes" aria-hidden="true">
        <div className="tl-lane-head tl-lane-head--left">
          <strong>Role-play antarteman</strong>
          <span className="tl-state">Menunggu umpan balik</span>
        </div>
        <div className="tl-lane-head tl-lane-head--right">
          <strong>Dengan Reharsa</strong>
          <span className="tl-state">Contoh alur · Nyepi</span>
        </div>
      </div>

      <div className="tl-track">
        <div className="tl-staff" aria-hidden="true">
          <span className="tl-staff-fill" />
          <span className="tl-staff-light" />
        </div>

        <ol className="tl-steps">
          {STEPS.map((step) => (
            <li key={step.when} className="tl-step">
              <div className="tl-when">
                <span>{step.when}</span>
              </div>

              <div className="tl-cell tl-cell--left">
                {step.waiting ? (
                  <p className="tl-quiet">
                    <span className="tl-lane-label">Role-play antarteman: </span>
                    {step.waiting}
                  </p>
                ) : null}
                {step.classroom ? (
                  <div className="tl-entry-left">
                    <span className="tl-lane-label">Role-play antarteman</span>
                    <p className="tl-title">{step.classroom.title}</p>
                  </div>
                ) : null}
              </div>

              <div className="tl-cell tl-cell--right">
                {step.reharsa ? (
                  <div className="card tl-entry-right">
                    <span className="tl-lane-label">Dengan Reharsa</span>
                    <p className="tl-title">{step.reharsa.title}</p>
                    <div className="tl-foot">
                      <span>Emosi tamu {step.reharsa.emotion}/10</span>
                      <span className="text-muted">{step.reharsa.turn}</span>
                    </div>
                  </div>
                ) : null}
                {step.report ? (
                  <div className="tl-entry-report">
                    <span className="tl-lane-label">Dengan Reharsa</span>
                    <p>{step.report}</p>
                  </div>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
