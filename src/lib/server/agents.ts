import "server-only";
import type { Scenario } from "@/lib/scenarios";
import {
  CoachSchema,
  EvaluationSchema,
  GuestReplySchema,
  type Turn,
} from "@/lib/types";
import { callJSON } from "./llm";

function transcriptText(scenario: Scenario, turns: Turn[]) {
  return turns
    .map((t) =>
      t.speaker === "guest"
        ? `${scenario.guest.name.toUpperCase()}: ${t.text}`
        : `STAFF: ${t.text}`,
    )
    .join("\n");
}

/**
 * Agen Tamu: bermain peran sebagai tamu. Hanya boleh memakai fakta dari
 * skenario dan mengembalikan emosi baru 0-10 setiap giliran.
 */
export async function guestTurn(
  scenario: Scenario,
  turns: Turn[],
  currentEmotion: number,
) {
  const role = scenario.kind === "interview" ? "interviewer" : "hotel guest";
  const staff = scenario.kind === "interview" ? "candidate" : "staff member";
  const channel =
    scenario.channel === "telepon"
      ? `This is a phone call. You cannot see the ${staff}; you only hear them. React to how things sound (long silences, unclear numbers) and ask them to repeat when needed.`
      : `This is face to face at the desk or table.`;

  // Balasan tamu ke-n setelah kalimat pembuka. Twist diungkap tepat sekali.
  const replyNumber = turns.filter((t) => t.speaker === "guest").length;
  const twist =
    scenario.twist && replyNumber === scenario.twist.at
      ? `\nIn THIS reply, after reacting to what the ${staff} said, bring up something new in your own words: ${scenario.twist.reveal} The ${staff} must now adapt their solution.`
      : scenario.twist && replyNumber > scenario.twist.at
        ? `\nYou already told the ${staff}: ${scenario.twist.reveal} Keep it in mind.`
        : "";

  const system = `You are role-playing as ${scenario.guest.name}, a ${role} from ${scenario.guest.origin}, in a training simulation for Indonesian hospitality students.

Persona: ${scenario.guest.persona}
Situation: ${scenario.situation}
${channel}
What you want (never say this outright): ${scenario.hiddenGoal}${twist}

Facts about this world. Treat them as the only truth. If the ${staff} says something that contradicts them, react the way a real ${role} would (confused or doubtful). Never invent new hotel facts, prices or services:
${scenario.facts.map((f) => `- ${f}`).join("\n")}

How you talk (this is spoken out loud by a text-to-speech voice):
- Sound like a real person on the phone or at a desk, not like a written email. Use contractions (I'm, it's, don't), everyday words and the occasional natural filler (look, okay, hmm, right) where it fits. Never use bullet points, lists or stage directions. Plain text only: no asterisks, underscores or other markdown for emphasis; show emphasis through word choice instead.
- Usually 1 or 2 sentences. Let your mood shape the wording: when upset, short and blunt, may interrupt or repeat your point; when calm, warmer and more relaxed.
- React to what the ${staff} just said, in your own words. Pick up on specifics (a time, an offer, a mistake). Don't parrot their sentence back and don't thank them for everything.
- Don't solve the problem for them. If their answer is vague, push back or ask a pointed follow-up the way a real ${role} would.
- Vary how you start your sentences; don't open every reply the same way.

Rules:
- Stay in character the whole time.
- Your current emotion is ${currentEmotion} on a 0-10 scale (0 calm and satisfied, 10 furious). Update it after reading the ${staff}'s last message: empathy, a sincere apology, accurate information and a concrete solution lower it; ignoring you, arguing, vague answers or wrong facts raise it. Change it by at most 3 per turn.
- Set "resolved" to true only when your need has been met and you are ready to end the conversation, then say a short closing line.
- If the ${staff} is rude or writes something inappropriate, stay professional and in character, and react as an offended ${role} would.
- Never mention that you are an AI, a simulation or a language model.

Reply only with JSON: {"reply": string, "emotion": integer 0-10, "emotion_reason": short reason in Bahasa Indonesia, "resolved": boolean}`;

  const user = `Conversation so far:\n${transcriptText(scenario, turns)}\n\nWrite ${scenario.guest.name}'s next reply.`;

  const result = await callJSON(
    "guest",
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    GuestReplySchema,
    0.7,
  );
  // Cadangan bila model tetap memakai markdown: kalimat tamu tampil di layar
  // dan dibacakan suara, jadi tanda seperti *ini* tidak boleh ikut.
  return {
    ...result,
    data: { ...result.data, reply: plainSpeech(result.data.reply) },
  };
}

/**
 * Hapus penanda markdown dari ucapan: *tebal*, _miring_, `kode`, dan # judul
 * di awal baris. Hanya penanda di batas kata yang dihapus, jadi "one_oh_eight",
 * "5 * 2", dan "room #108" tetap utuh.
 */
export function plainSpeech(text: string) {
  return text
    .replace(
      /(^|[\s(["'])(\*{1,3}|_{1,3})(\S(?:.*?\S)?)\2(?=$|[\s.,!?;:)\]"'])/g,
      "$1$3",
    )
    .replace(/(?<=\S)\*+(?=\S)|(?<=^|\s)\*+(?=\S)|(?<=\S)\*+(?=\s|$)/g, "")
    .replace(/`/g, "")
    .replace(/^#+\s*/gm, "")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

/**
 * Agen Penilai: menilai transkrip dengan rubrik. Terpisah dari Agen Tamu
 * supaya skor tidak dipengaruhi jalannya role-play.
 */
export async function evaluate(scenario: Scenario, turns: Turn[]) {
  const system = `You are a strict but fair assessor for hospitality vocational training in Indonesia. You assess only the STAFF lines in a transcript of a role-play.

Scenario: ${scenario.situation}
Student role: ${scenario.studentRole}
Student goal: ${scenario.goal}

Facts the student was allowed to use:
${scenario.facts.map((f) => `- ${f}`).join("\n")}

Rubric (score each criterion 0-4):
${scenario.criteria.map((c) => `- id "${c.id}" (${c.label}): ${c.rubric}`).join("\n")}

Rules:
- Score 0 when the STAFF said nothing that addresses the criterion at all. Then "evidence" is an empty string.
- Otherwise score 1-4 by the rubric, based only on what the STAFF actually said. "evidence" must be an exact quote from a STAFF line.
- Judge clarity and politeness, not how native the accent or word choice sounds. Indonesian-style English that is clear and polite is not penalised.
- "comment" explains the score in Bahasa Indonesia in one or two sentences, addressed to the student as "kamu".
- "confidence" is 0-1: lower it when the transcript is too short or the evidence is ambiguous.

Reply only with JSON: {"criteria": [{"id": string, "score": integer 0-4, "evidence": string, "comment": string, "confidence": number}]} with exactly one entry per rubric id, in rubric order.`;

  const user = `Transcript:\n${transcriptText(scenario, turns)}`;

  const result = await callJSON(
    "judge",
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    EvaluationSchema,
    0.1,
  );

  // Buang id yang tidak ada di rubrik dan pastikan urutannya sesuai rubrik.
  const byId = new Map(result.data.criteria.map((c) => [c.id, c]));
  const criteria = scenario.criteria.flatMap((c) => {
    const found = byId.get(c.id);
    return found ? [found] : [];
  });
  return { data: { criteria }, provider: result.provider };
}

/** Agen Coach: umpan balik dan contoh kalimat yang lebih baik. */
export async function coach(scenario: Scenario, turns: Turn[]) {
  const system = `You are a friendly hospitality English coach for Indonesian students. Write in Bahasa Indonesia, addressing the student as "kamu".

Scenario: ${scenario.situation}
Student goal: ${scenario.goal}

Task:
- "summary": 2-3 sentences: one concrete thing the student did well, and the single most important thing to improve next time. Be specific to this transcript.
- "better_phrases": up to 3 STAFF lines worth improving. "original" is the exact STAFF line, "suggestion" is a better English version a hotel professional would say, "why" explains briefly in Bahasa Indonesia.
- Do not invent facts beyond the scenario.

Reply only with JSON: {"summary": string, "better_phrases": [{"original": string, "suggestion": string, "why": string}]}`;

  const user = `Transcript:\n${transcriptText(scenario, turns)}`;

  return callJSON(
    "judge",
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    CoachSchema,
    0.4,
  );
}
