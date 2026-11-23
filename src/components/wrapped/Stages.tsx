import { useEffect, useRef, useState, type ReactNode } from "react";
import { Pause, Play } from "lucide-react";
import {
  AWARD_TYPES,
  articleFor,
  buildOptions,
  daysKnown,
  flameLevel,
  messageChange,
  type AwardType,
  type WrappedData,
} from "@/lib/wrapped-logic";

export type StageProps = { name: string; code: string; w: WrappedData; next: () => void };

const Next = ({ onClick, children = "NEXT →" }: { onClick: () => void; children?: ReactNode }) => (
  <button className="btn-pill animate-rise mt-10" onClick={onClick}>{children}</button>
);
const Big = ({ children }: { children: ReactNode }) => (
  <h1 className="animate-rise text-balance text-4xl font-black leading-[1.05] sm:text-5xl">{children}</h1>
);
const Sub = ({ children, delay = 150 }: { children: ReactNode; delay?: number }) => (
  <p className="animate-rise mt-4 text-balance text-lg font-medium text-foreground/85" style={{ animationDelay: `${delay}ms` }}>{children}</p>
);

function useCountUp(target: number, duration: number, power: number, start: boolean) {
  const [v, setV] = useState(0);
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!start) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      setV(Math.round(target * Math.pow(p, power)));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setDone(true);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, power, start]);
  return { v, done };
}

export function Intro({ name, w, next }: StageProps) {
  return (
    <>
      <p className="animate-rise text-sm font-extrabold uppercase tracking-[0.3em]">Your 2026 Wrapped is here</p>
      {w.avatar && (
        <img src={w.avatar} alt={name} className="animate-rise mx-auto mt-8 size-36 rounded-full object-cover ring-4 ring-foreground" style={{ animationDelay: "150ms" }} />
      )}
      <h1 className="animate-rise mt-8 text-4xl font-black sm:text-5xl" style={{ animationDelay: "300ms" }}>
        {w.greeting} <span className="underline decoration-4 underline-offset-8">{name}</span>
      </h1>
      <Next onClick={next}>LET'S GO →</Next>
    </>
  );
}

export function Known({ w, next }: StageProps) {
  return (
    <>
      <Big>2026 was a feast for both of us...</Big>
      <Sub delay={600}>we've known each other for <b className="font-black">{daysKnown(w.knownSince).toLocaleString()} days</b>!</Sub>
      <Next onClick={next}>WOW, OKAY →</Next>
    </>
  );
}

const LETTERS = ["A", "B", "C", "D"];

export function MessagesQuiz({ code, w, next }: StageProps) {
  const opts = buildOptions(w.messages2026, 2, code + "msg");
  const [picked, setPicked] = useState<number | null>(null);
  const duration = Math.min(10000, 4000 + w.messages2026 / 10);
  const { v, done } = useCountUp(w.messages2026, duration, 3, picked !== null);
  if (picked === null)
    return (
      <>
        <Big>Take a guess.</Big>
        <Sub>How many messages have we sent to each other in 2026?</Sub>
        <div className="mt-8 grid w-full gap-3">
          {opts.map((o, i) => (
            <button key={i} onClick={() => setPicked(o)} className="btn-outline-pill animate-rise justify-start text-lg" style={{ animationDelay: `${300 + i * 100}ms` }}>
              <span className="font-black">{LETTERS[i]}</span> {o.toLocaleString()}
            </button>
          ))}
        </div>
      </>
    );
  const right = picked === w.messages2026;
  return (
    <>
      <Sub delay={0}>Let's see if you were right...</Sub>
      <p className="mt-6 text-6xl font-black tabular-nums sm:text-7xl">{v.toLocaleString()}</p>
      {done && (
        <>
          <Sub delay={0}>
            You selected {picked.toLocaleString()}, this was{" "}
            <b className={right ? "text-success" : "text-destructive"}>{right ? "right!" : "wrong..."}</b>
          </Sub>
          <Next onClick={next} />
        </>
      )}
    </>
  );
}

export function MessagesCompare({ w, next }: StageProps) {
  const c = messageChange(w.messages2026, w.messages2025);
  return (
    <>
      <p className="animate-rise text-7xl font-black">{c.percent}%</p>
      <Sub>We've talked <b>{c.percent}% {c.direction}</b> than in 2025, where we had sent <b>{w.messages2025.toLocaleString()}</b> messages.</Sub>
      <Next onClick={next} />
    </>
  );
}

export function HoursQuiz({ code, w, next }: StageProps) {
  const opts = buildOptions(w.hours2026, 1, code + "hrs");
  const [picked, setPicked] = useState<number | null>(null);
  return (
    <>
      <Big>As you can see, we communicated a lot!</Big>
      <Sub>But how many hours were spent gaming together?</Sub>
      <div className="mt-8 grid w-full gap-3">
        {opts.map((o, i) => {
          const state = picked === null ? "" : o === w.hours2026 ? "border-success bg-success text-primary-foreground" : "border-destructive bg-destructive";
          return (
            <button key={i} disabled={picked !== null} onClick={() => setPicked(o)} className={`btn-outline-pill animate-rise justify-start text-lg disabled:opacity-100 ${state}`} style={{ animationDelay: `${300 + i * 100}ms` }}>
              <span className="font-black">{LETTERS[i]}</span> {o.toLocaleString()} hours
            </button>
          );
        })}
      </div>
      {picked !== null && <Next onClick={next} />}
    </>
  );
}

const FLAME_COLOR = {
  unlit: "text-flame-unlit",
  fire: "text-flame-fire",
  purple: "text-flame-purple",
  diamond: "text-flame-diamond",
  emerald: "text-flame-emerald",
} as const;

export function Streak({ w, next }: StageProps) {
  const [go, setGo] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setGo(true), 1200);
    return () => clearTimeout(t);
  }, []);
  const { v, done } = useCountUp(w.streak, Math.min(10000, 2500 + w.streak * 300), 1.6, go);
  const lvl = flameLevel(v);
  return (
    <>
      <Sub delay={0}>Our longest conversation streak was...</Sub>
      <div className="relative mt-6 flex h-64 items-center justify-center">
        <svg viewBox="0 0 24 24" className={`absolute h-64 w-64 transition-colors duration-500 ${FLAME_COLOR[lvl]} ${lvl !== "unlit" ? "animate-flicker" : ""}`} fill="currentColor" aria-hidden>
          <path d="M12 2c1 3.5 5 5.5 5 11a5 5 0 0 1-10 0c0-2.4 1.1-4.2 2.4-5.4.3 1.7 1.2 2.8 2.3 3.3C11 8.5 11 5 12 2Z" opacity={lvl === "unlit" ? 0.5 : 0.95} />
        </svg>
        <span className="relative text-7xl font-black tabular-nums text-primary drop-shadow-lg">{v}</span>
      </div>
      {done && (
        <>
          <Sub delay={0}>days. Do you think we can have a higher streak in 2027?</Sub>
          <Next onClick={next} />
        </>
      )}
    </>
  );
}

export function Personality({ w, next }: StageProps) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (shown >= 3) return;
    const t = setTimeout(() => setShown((s) => s + 1), shown === 0 ? 1500 : 5000);
    return () => clearTimeout(t);
  }, [shown]);
  const lines = [
    <>I believe you relate most to a <b>{w.animalEmoji} {w.animalName}</b>.</>,
    <>With everything you've shown me this year, I believe you're going to be {articleFor(w.job)} <b>{w.job}</b> when you grow up.</>,
    <>If I had one word to describe you, you would best fit the description of {articleFor(w.personality)} <b>{w.personality}</b>.</>,
  ];
  return (
    <>
      <Big>YOUR PERSONALITY THIS YEAR</Big>
      <div className="mt-6 flex flex-col gap-4">
        {lines.slice(0, shown).map((l, i) => <Sub key={i} delay={0}>{l}</Sub>)}
      </div>
      {shown >= 3 && <Next onClick={next} />}
    </>
  );
}

function SpinAward({ award, onDone }: { award: { type: AwardType; text: string }; onDone: () => void }) {
  const keys = Object.keys(AWARD_TYPES) as AwardType[];
  const [i, setI] = useState(0);
  const [stopped, setStopped] = useState(false);
  useEffect(() => {
    let n = 0;
    const total = 18 + keys.indexOf(award.type);
    let delay = 60;
    let t: ReturnType<typeof setTimeout>;
    const step = () => {
      n++;
      setI(n % keys.length);
      if (n >= total) {
        setStopped(true);
        onDone();
        return;
      }
      delay *= 1.12;
      t = setTimeout(step, delay);
    };
    t = setTimeout(step, delay);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const cur = AWARD_TYPES[keys[i]!];
  return (
    <div className="flex flex-col items-center">
      <span className={`text-8xl transition-transform ${stopped ? "scale-125" : ""}`}>{cur.emoji}</span>
      <p className="mt-3 text-xl font-black">{stopped ? AWARD_TYPES[award.type].label : "…"}</p>
      {stopped && <Sub delay={0}>{award.text}</Sub>}
    </div>
  );
}

export function Awards({ w, next }: StageProps) {
  const [idx, setIdx] = useState(0);
  const [ready, setReady] = useState(false);
  const last = idx >= w.awards.length - 1;
  return (
    <>
      <Big>YOUR 2026 AWARDS</Big>
      <div className="mt-10 min-h-56">
        {w.awards[idx] && <SpinAward key={idx} award={w.awards[idx]!} onDone={() => setReady(true)} />}
      </div>
      {ready && (
        <Next onClick={() => { if (last) next(); else { setReady(false); setIdx(idx + 1); } }}>
          {last ? "NEXT →" : "NEXT AWARD →"}
        </Next>
      )}
    </>
  );
}

export function Moments({ w, next }: StageProps) {
  return (
    <>
      <Big>THE MOMENTS THAT MATTERED</Big>
      <div className="mt-8 flex w-full flex-col items-center gap-5">
        {w.funny.type === "image" && w.funny.image ? (
          <img src={w.funny.image} alt="Funniest moment" className="animate-rise max-h-[40vh] rounded-2xl object-contain" />
        ) : null}
        {w.funny.text && (
          <p className="animate-rise text-balance text-2xl font-extrabold">
            {w.funny.type === "quote" ? `“${w.funny.text}”` : w.funny.text}
          </p>
        )}
        {w.favourite && (
          <img src={w.favourite} alt="Favourite moment" className="animate-rise max-h-[35vh] rotate-2 rounded-2xl object-contain ring-4 ring-foreground" style={{ animationDelay: "300ms" }} />
        )}
      </div>
      <Next onClick={next} />
    </>
  );
}

export function Achievements({ w, next }: StageProps) {
  return (
    <>
      <Big>WHAT YOU'VE ACHIEVED THIS YEAR...</Big>
      <ol className="mt-8 flex w-full flex-col gap-3 text-left">
        {w.achievements.map((a, i) => (
          <li key={i} className="animate-rise flex items-baseline gap-4 rounded-2xl bg-background/70 p-4 backdrop-blur" style={{ animationDelay: `${300 + i * 250}ms` }}>
            <span className="text-3xl font-black">{i + 1}</span>
            <span className="text-lg font-semibold">{a}</span>
          </li>
        ))}
      </ol>
      <Next onClick={next} />
    </>
  );
}

export function Phrase({ w, next }: StageProps) {
  return (
    <>
      <Sub delay={0}>YOUR MOST USED PHRASE WAS...</Sub>
      <p className="animate-rise mt-6 text-balance text-5xl font-black" style={{ animationDelay: "800ms" }}>“{w.phrase}”</p>
      <Next onClick={next} />
    </>
  );
}

export function Song({ w, next }: StageProps) {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const a = audio.current;
    a?.play().then(() => setPlaying(true)).catch(() => {});
    const t0 = Date.now();
    const iv = setInterval(() => setProgress(Math.min(1, (Date.now() - t0) / 10000)), 100);
    const t = setTimeout(next, 10000);
    return () => { clearInterval(iv); clearTimeout(t); a?.pause(); };
  }, [next]);
  return (
    <>
      <Sub delay={0}>A SONG THAT RECAPS OUR YEAR IS...</Sub>
      {w.song.cover ? (
        <img src={w.song.cover} alt={w.song.title} className="animate-rise mx-auto mt-8 aspect-square w-64 rounded-xl object-cover shadow-2xl" />
      ) : (
        <div className="wrapped-ribbon animate-rise mx-auto mt-8 aspect-square w-64 rounded-xl" />
      )}
      <h1 className="mt-6 text-3xl font-black">{w.song.title}</h1>
      <p className="text-foreground/70">{w.song.artist}</p>
      {w.song.audio && <audio ref={audio} src={w.song.audio} />}
      <div className="mx-auto mt-6 flex w-64 items-center gap-3">
        <button
          aria-label={playing ? "Pause" : "Play"}
          className="btn-pill size-12 shrink-0 p-0"
          onClick={() => {
            const a = audio.current;
            if (!a) return;
            if (a.paused) a.play().then(() => setPlaying(true)); else { a.pause(); setPlaying(false); }
          }}
        >
          {playing ? <Pause className="size-5" /> : <Play className="size-5" />}
        </button>
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-foreground/25">
          <div className="h-full bg-foreground" style={{ width: `${progress * 100}%` }} />
        </div>
      </div>
    </>
  );
}

export function End({ next }: StageProps) {
  return (
    <>
      <Big>THAT WAS YOUR 2026.</Big>
      <Sub>Let's subscribe to our friendship for 2027!</Sub>
      <Next onClick={next}>Subscribe</Next>
    </>
  );
}

export function Closing({ name, onClose }: StageProps & { onClose: () => void }) {
  return (
    <>
      <div className="animate-toast-in fixed inset-x-3 top-4 z-30 mx-auto flex max-w-sm items-center gap-3 rounded-2xl bg-card p-4 text-left shadow-2xl">
        <span className="text-2xl">✅</span>
        <div>
          <p className="font-bold">Subscription successful</p>
          <p className="text-sm text-muted-foreground">Friendship renewed for 2027.</p>
        </div>
      </div>
      <Big>See you next year, {name}.</Big>
      <Next onClick={onClose}>Close</Next>
    </>
  );
}
