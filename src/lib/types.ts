import { z } from "zod";

export type Speaker = "guest" | "student";

export type Turn = {
  speaker: Speaker;
  text: string;
  // Emosi tamu setelah giliran ini (0-10), hanya untuk giliran tamu.
  emotion?: number;
};

export const TurnSchema = z.object({
  speaker: z.enum(["guest", "student"]),
  text: z.string().min(1).max(2000),
  emotion: z.number().min(0).max(10).optional(),
});

// Output Agen Tamu per giliran.
export const GuestReplySchema = z.object({
  reply: z.string().min(1).max(800),
  emotion: z.number().int().min(0).max(10),
  emotion_reason: z.string().max(300),
  resolved: z.boolean(),
});
export type GuestReply = z.infer<typeof GuestReplySchema>;

// Output Agen Penilai.
export const EvaluationSchema = z.object({
  criteria: z.array(
    z.object({
      id: z.string(),
      score: z.number().int().min(1).max(4),
      evidence: z.string().max(400),
      comment: z.string().max(400),
      confidence: z.number().min(0).max(1),
    }),
  ),
});
export type Evaluation = z.infer<typeof EvaluationSchema>;

// Output Agen Coach.
export const CoachSchema = z.object({
  summary: z.string().max(600),
  better_phrases: z
    .array(
      z.object({
        original: z.string().max(400),
        suggestion: z.string().max(400),
        why: z.string().max(300),
      }),
    )
    .max(4),
});
export type Coaching = z.infer<typeof CoachSchema>;

export type WordScore = {
  word: string;
  accuracy: number;
  errorType: string;
};

export type PronunciationResult = {
  accuracy: number;
  fluency: number;
  completeness: number;
  words: WordScore[];
};

export type ServiceStatus = {
  // Jumlah provider LLM yang terkonfigurasi (urutan cadangan).
  llm: number;
  // Speech-to-Text server (Whisper) tersedia.
  stt: boolean;
  azure: boolean;
};
