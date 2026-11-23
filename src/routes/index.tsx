import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { checkCode } from "@/lib/wrapped.functions";

const TITLE = "joell.lol Wrapped 2026 — Your Year, Recapped";
const DESC =
  "Your 2026 friendship recap is here! Discover your funniest moments, biggest achievements, memorable conversations and more.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  const check = useServerFn(checkCode);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const c = code.trim().toUpperCase();
    if (!c) return;
    setBusy(true);
    setError("");
    const { exists } = await check({ data: { code: c } });
    setBusy(false);
    if (!exists) return setError("That code doesn't exist. Double-check it?");
    navigate({ to: "/wrapped/$code/$stage", params: { code: c, stage: "0" } });
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm text-center animate-rise">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground">joell.lol</p>
        <h1 className="mt-3 text-5xl font-black leading-[0.95]">
          Wrapped
          <br />
          2026
        </h1>
        <p className="mt-6 text-muted-foreground">Enter your code to access your wrapped</p>
        <form onSubmit={submit} className="mt-6 flex flex-col gap-3">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="ABC123"
            maxLength={12}
            autoCapitalize="characters"
            className="field text-center text-2xl font-extrabold tracking-[0.35em]"
            aria-label="Your code"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button className="btn-pill w-full" disabled={busy || !code.trim()}>
            {busy ? "Checking…" : "Continue"}
          </button>
        </form>
      </div>
    </main>
  );
}
