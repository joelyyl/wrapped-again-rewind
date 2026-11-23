import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState, type ReactNode } from "react";
import { Plus, X } from "lucide-react";
import { AdminGate } from "@/components/wrapped/AdminGate";
import { supabase } from "@/integrations/supabase/client";
import { createWrapped, getUploadUrl } from "@/lib/wrapped.functions";
import { AWARD_TYPES, GREETINGS, type AwardType } from "@/lib/wrapped-logic";

export const Route = createFileRoute("/admin_/new")({
  head: () => ({
    meta: [
      { title: "New Wrapped — joell.lol Wrapped 2026" },
      { name: "description", content: "Create a new friend wrapped." },
      { property: "og:title", content: "New Wrapped — joell.lol Wrapped 2026" },
      { property: "og:description", content: "Create a new friend wrapped." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <AdminGate>{(pw) => <NewForm pw={pw} />}</AdminGate>,
});

function Section({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section className="rounded-3xl bg-card p-5 sm:p-7">
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground">S{n}</p>
      <h2 className="mb-5 text-2xl font-black">{title}</h2>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
function FilePick({ accept, file, onChange }: { accept: string; file: File | null; onChange: (f: File | null) => void }) {
  return (
    <div className="flex items-center gap-3">
      <label className="btn-outline-pill cursor-pointer">
        {file ? "Change file" : "Upload"}
        <input type="file" accept={accept} className="hidden" onChange={(e) => onChange(e.target.files?.[0] ?? null)} />
      </label>
      <span className="truncate text-sm text-muted-foreground">{file?.name ?? "No file"}</span>
    </div>
  );
}

function NewForm({ pw }: { pw: string }) {
  const create = useServerFn(createWrapped);
  const upload = useServerFn(getUploadUrl);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [knownSince, setKnownSince] = useState("");
  const [greeting, setGreeting] = useState<string>(GREETINGS[0]);
  const [animalEmoji, setAnimalEmoji] = useState("");
  const [animalName, setAnimalName] = useState("");
  const [job, setJob] = useState("");
  const [personality, setPersonality] = useState("");
  const [m26, setM26] = useState("");
  const [m25, setM25] = useState("");
  const [hours, setHours] = useState("");
  const [streak, setStreak] = useState("");
  const [funnyType, setFunnyType] = useState<"image" | "joke" | "quote">("quote");
  const [funnyText, setFunnyText] = useState("");
  const [funnyImg, setFunnyImg] = useState<File | null>(null);
  const [phrase, setPhrase] = useState("");
  const [achievements, setAchievements] = useState<string[]>([""]);
  const [awards, setAwards] = useState<{ type: AwardType; text: string }[]>([{ type: "trophy", text: "" }]);
  const [songTitle, setSongTitle] = useState("");
  const [songArtist, setSongArtist] = useState("");
  const [cover, setCover] = useState<File | null>(null);
  const [audio, setAudio] = useState<File | null>(null);
  const [favourite, setFavourite] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState("");

  async function put(f: File | null) {
    if (!f) return null;
    const ext = (f.name.split(".").pop() ?? "bin").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5) || "bin";
    const { path, token } = await upload({ data: { password: pw, ext } });
    const { error } = await supabase.storage.from("wrapped-media").uploadToSignedUrl(path, token, f);
    if (error) throw new Error(error.message);
    return path;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim() || !knownSince) return setError("Name and the date you met are required.");
    if (!m26 || !m25 || !hours || !streak) return setError("Fill in all statistics.");
    if (funnyType === "image" && !funnyImg) return setError("Upload the funniest moment image.");
    setBusy(true);
    try {
      const [a, fi, c, au, fav] = await Promise.all([
        put(avatar),
        put(funnyType === "image" ? funnyImg : null),
        put(cover),
        put(audio),
        put(favourite),
      ]);
      const res = await create({
        data: {
          password: pw,
          name: name.trim(),
          wrapped: {
            greeting,
            avatar: a,
            knownSince,
            animalEmoji,
            animalName,
            job,
            personality,
            messages2026: Number(m26),
            messages2025: Number(m25),
            hours2026: Number(hours),
            streak: Number(streak),
            funny: { type: funnyType, text: funnyText, image: fi },
            phrase,
            achievements: achievements.map((x) => x.trim()).filter(Boolean).slice(0, 5),
            awards: awards.filter((x) => x.text.trim()),
            song: { title: songTitle, artist: songArtist, cover: c, audio: au },
            favourite: fav,
          },
        },
      });
      setCreated(res.code);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  if (created)
    return (
      <main className="flex min-h-dvh items-center justify-center bg-background px-6 text-center">
        <div className="animate-rise">
          <p className="text-muted-foreground">{name}'s wrapped is ready. Their code:</p>
          <p className="mt-3 font-mono text-5xl font-black tracking-[0.25em]">{created}</p>
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/wrapped/$code/$stage" params={{ code: created, stage: "0" }} className="btn-pill">Preview</Link>
            <Link to="/admin" className="btn-outline-pill">Back to wraps</Link>
          </div>
        </div>
      </main>
    );

  return (
    <main className="min-h-dvh bg-background px-4 py-10">
      <form onSubmit={submit} className="mx-auto flex max-w-2xl flex-col gap-5">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-black">New Wrapped</h1>
          <Link to="/admin" className="btn-outline-pill">Cancel</Link>
        </div>

        <Section n={1} title="Information">
          <Field label="Friend's name"><input className="field" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} /></Field>
          <Field label="Profile picture"><FilePick accept="image/*" file={avatar} onChange={setAvatar} /></Field>
          <Field label="Known each other since"><input type="date" className="field" value={knownSince} onChange={(e) => setKnownSince(e.target.value)} /></Field>
          <Field label="Greeting">
            <div className="flex flex-wrap gap-2">
              {GREETINGS.map((g) => (
                <button type="button" key={g} onClick={() => setGreeting(g)} className={greeting === g ? "btn-pill px-4 py-2" : "btn-outline-pill px-4 py-2"}>{g}</button>
              ))}
            </div>
          </Field>
        </Section>

        <Section n={2} title="Personality">
          <div className="grid grid-cols-[5rem_1fr] gap-3">
            <Field label="Emoji"><input className="field text-center text-xl" value={animalEmoji} onChange={(e) => setAnimalEmoji(e.target.value)} maxLength={16} placeholder="🦦" /></Field>
            <Field label="Animal"><input className="field" value={animalName} onChange={(e) => setAnimalName(e.target.value)} maxLength={60} placeholder="Otter" /></Field>
          </div>
          <Field label="Future job"><input className="field" value={job} onChange={(e) => setJob(e.target.value)} maxLength={80} placeholder="astronaut" /></Field>
          <Field label="Personality in one word"><input className="field" value={personality} onChange={(e) => setPersonality(e.target.value)} maxLength={60} placeholder="icon" /></Field>
        </Section>

        <Section n={3} title="Statistics">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Messages in 2026"><input type="number" min={0} className="field" value={m26} onChange={(e) => setM26(e.target.value)} /></Field>
            <Field label="Messages in 2025"><input type="number" min={0} className="field" value={m25} onChange={(e) => setM25(e.target.value)} /></Field>
            <Field label="Hours played together (2026)"><input type="number" min={0} className="field" value={hours} onChange={(e) => setHours(e.target.value)} /></Field>
            <Field label="Longest streak (days)"><input type="number" min={0} className="field" value={streak} onChange={(e) => setStreak(e.target.value)} /></Field>
          </div>
        </Section>

        <Section n={4} title="Personal Moments">
          <Field label="Funniest moment">
            <div className="flex gap-2">
              {(["image", "joke", "quote"] as const).map((t) => (
                <button type="button" key={t} onClick={() => setFunnyType(t)} className={funnyType === t ? "btn-pill px-4 py-2" : "btn-outline-pill px-4 py-2"}>
                  {t === "joke" ? "Inside joke" : t[0]!.toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </Field>
          {funnyType === "image" ? (
            <FilePick accept="image/*" file={funnyImg} onChange={setFunnyImg} />
          ) : null}
          <Field label={funnyType === "image" ? "Caption (optional)" : funnyType === "joke" ? "The inside joke" : "The quote"}>
            <textarea className="field min-h-20" value={funnyText} onChange={(e) => setFunnyText(e.target.value)} maxLength={500} />
          </Field>
          <Field label="Most used phrase"><input className="field" value={phrase} onChange={(e) => setPhrase(e.target.value)} maxLength={200} /></Field>
          <Field label="Achievements (up to 5)">
            {achievements.map((a, i) => (
              <div key={i} className="flex gap-2">
                <input className="field" value={a} maxLength={200} onChange={(e) => setAchievements(achievements.map((x, j) => (j === i ? e.target.value : x)))} />
                {achievements.length > 1 && (
                  <button type="button" aria-label="Remove" className="btn-outline-pill px-3" onClick={() => setAchievements(achievements.filter((_, j) => j !== i))}><X className="size-4" /></button>
                )}
              </div>
            ))}
            {achievements.length < 5 && (
              <button type="button" className="btn-outline-pill self-start" onClick={() => setAchievements([...achievements, ""])}><Plus className="size-4" /> Add</button>
            )}
          </Field>
          <Field label="Awards">
            {awards.map((a, i) => (
              <div key={i} className="flex flex-col gap-2 rounded-2xl bg-muted p-3">
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(AWARD_TYPES) as AwardType[]).map((t) => (
                    <button type="button" key={t} onClick={() => setAwards(awards.map((x, j) => (j === i ? { ...x, type: t } : x)))} className={a.type === t ? "btn-pill px-3 py-1.5" : "btn-outline-pill px-3 py-1.5"}>
                      {AWARD_TYPES[t].emoji} {AWARD_TYPES[t].label}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input className="field" placeholder="Because you're a winner" value={a.text} maxLength={120} onChange={(e) => setAwards(awards.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)))} />
                  {awards.length > 1 && (
                    <button type="button" aria-label="Remove" className="btn-outline-pill px-3" onClick={() => setAwards(awards.filter((_, j) => j !== i))}><X className="size-4" /></button>
                  )}
                </div>
              </div>
            ))}
            {awards.length < 5 && (
              <button type="button" className="btn-outline-pill self-start" onClick={() => setAwards([...awards, { type: "medal", text: "" }])}><Plus className="size-4" /> Add award</button>
            )}
          </Field>
        </Section>

        <Section n={5} title="Memories & Recap">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Song title"><input className="field" value={songTitle} onChange={(e) => setSongTitle(e.target.value)} maxLength={120} /></Field>
            <Field label="Artist"><input className="field" value={songArtist} onChange={(e) => setSongArtist(e.target.value)} maxLength={120} /></Field>
          </div>
          <Field label="Album cover"><FilePick accept="image/*" file={cover} onChange={setCover} /></Field>
          <Field label="Song audio (mp3, a short clip is fine)"><FilePick accept="audio/*" file={audio} onChange={setAudio} /></Field>
          <Field label="Favourite moment (screenshot)"><FilePick accept="image/*" file={favourite} onChange={setFavourite} /></Field>
        </Section>

        {error && <p className="text-center text-destructive">{error}</p>}
        <button className="btn-pill w-full py-4 text-base" disabled={busy}>{busy ? "Creating…" : "Create Wrapped"}</button>
      </form>
    </main>
  );
}
