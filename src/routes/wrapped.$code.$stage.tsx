import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { X } from "lucide-react";
import { Art } from "@/components/wrapped/Art";
import * as S from "@/components/wrapped/Stages";
import { getWrapped } from "@/lib/wrapped.functions";

const wrappedQuery = (code: string) =>
  queryOptions({ queryKey: ["wrapped", code.toUpperCase()], queryFn: () => getWrapped({ data: { code } }), staleTime: Infinity });

const STAGES = [S.Intro, S.Known, S.MessagesQuiz, S.MessagesCompare, S.HoursQuiz, S.Streak, S.Personality, S.Awards, S.Moments, S.Achievements, S.Phrase, S.Song, S.End];
const TOTAL = STAGES.length + 1;
const TITLE = "joell.lol Wrapped 2026 — Your Year, Recapped";
const DESC = "Your 2026 friendship recap is here! Discover your funniest moments, biggest achievements, memorable conversations and more.";

export const Route = createFileRoute("/wrapped/$code/$stage")({
  loader: ({ params, context }) => context.queryClient.ensureQueryData(wrappedQuery(params.code)),
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
  component: Player,
});

function Player() {
  const { code, stage } = Route.useParams();
  const { data } = useSuspenseQuery(wrappedQuery(code));
  const navigate = useNavigate();
  const idx = Math.min(Math.max(parseInt(stage, 10) || 0, 0), TOTAL - 1);
  const next = useCallback(
    () => navigate({ to: "/wrapped/$code/$stage", params: { code, stage: String(idx + 1) }, replace: true }),
    [navigate, code, idx],
  );

  if (!data)
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-background px-6 text-center">
        <h1 className="text-3xl font-black">That code doesn't exist.</h1>
        <Link to="/" className="btn-pill">Try another code</Link>
      </main>
    );

  const props = { name: data.name, code: data.code, w: data.data, next };
  const Stage = STAGES[idx];

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-background">
      <div className="relative flex min-h-dvh w-full max-w-md flex-col overflow-hidden">
        <Art variant={idx} />
        <div className="relative z-10 flex gap-1 px-3 pt-3">
          {Array.from({ length: TOTAL }).map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full ${i <= idx ? "bg-foreground" : "bg-foreground/25"}`} />
          ))}
        </div>
        <div className="relative z-10 flex justify-between px-4 pt-3 text-xs font-extrabold uppercase tracking-[0.2em]">
          <span>joell.lol</span>
          <Link to="/" aria-label="Close"><X className="size-5" /></Link>
        </div>
        <section key={idx} className="animate-slide-in relative z-10 flex flex-1 flex-col items-center justify-center px-7 py-16 text-center">
          {Stage ? <Stage {...props} /> : <S.Closing {...props} onClose={() => navigate({ to: "/" })} />}
        </section>
      </div>
    </main>
  );
}
