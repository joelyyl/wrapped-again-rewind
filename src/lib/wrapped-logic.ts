// Pure helpers for the friend-facing Wrapped. No server or browser APIs here.

export const GREETINGS = ["Hello,", "Welcome,", "Hey,", "HEWWOO,", "-farts on:-", "omg hii,"] as const;
export const AWARD_TYPES = {
  trophy: { emoji: "🏆", label: "Trophy" },
  chocolate: { emoji: "🍫", label: "Chocolate" },
  medal: { emoji: "🥇", label: "Medal" },
  diamond: { emoji: "💎", label: "Diamond" },
  emerald: { emoji: "🟩", label: "Emerald" },
} as const;
export type AwardType = keyof typeof AWARD_TYPES;

export type WrappedData = {
  greeting: string;
  avatar: string | null;
  knownSince: string; // yyyy-mm-dd
  animalEmoji: string;
  animalName: string;
  job: string;
  personality: string;
  messages2026: number;
  messages2025: number;
  hours2026: number;
  streak: number;
  funny: { type: "image" | "joke" | "quote"; text: string; image: string | null };
  phrase: string;
  achievements: string[];
  awards: { type: AwardType; text: string }[];
  song: { title: string; artist: string; cover: string | null; audio: string | null };
  favourite: string | null;
};

function seeded(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

/** Four plausible options with the correct value at `correctIndex`. */
export function buildOptions(correct: number, correctIndex: number, seed: string): number[] {
  const rand = seeded(seed + ":" + correct);
  const spread = Math.max(correct * 0.12, 3);
  const minGap = Math.max(Math.round(correct * 0.02), 1);
  const picks = new Set<number>([correct]);
  let guard = 0;
  while (picks.size < 4 && guard++ < 500) {
    const off = (rand() * 2 - 1) * spread;
    const v = Math.max(1, Math.round(correct + off));
    if ([...picks].every((p) => Math.abs(p - v) >= minGap)) picks.add(v);
  }
  let filler = correct + minGap;
  while (picks.size < 4) picks.add((filler += minGap));
  const others = [...picks].filter((v) => v !== correct);
  others.splice(correctIndex, 0, correct);
  return others;
}

export function messageChange(m2026: number, m2025: number) {
  if (m2025 <= 0) return { percent: 100, direction: "more" as const };
  const pct = Math.round(((m2026 - m2025) / m2025) * 100);
  return { percent: Math.abs(pct), direction: pct >= 0 ? ("more" as const) : ("less" as const) };
}

export function daysKnown(since: string, now = new Date()) {
  const d = new Date(since + "T00:00:00Z");
  if (Number.isNaN(d.getTime())) return 0;
  return Math.max(0, Math.floor((now.getTime() - d.getTime()) / 86400000));
}

export type FlameLevel = "unlit" | "fire" | "purple" | "diamond" | "emerald";
export function flameLevel(n: number): FlameLevel {
  if (n >= 15) return "emerald";
  if (n >= 10) return "diamond";
  if (n >= 5) return "purple";
  if (n >= 1) return "fire";
  return "unlit";
}

export function articleFor(word: string) {
  return /^[aeiou]/i.test(word.trim()) ? "an" : "a";
}
