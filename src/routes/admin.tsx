import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useState } from "react";
import { Copy, Trash2 } from "lucide-react";
import { AdminGate } from "@/components/wrapped/AdminGate";
import { deleteWrapped, listWrappeds } from "@/lib/wrapped.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — joell.lol Wrapped 2026" },
      { name: "description", content: "Manage friend wraps." },
      { property: "og:title", content: "Admin — joell.lol Wrapped 2026" },
      { property: "og:description", content: "Manage friend wraps." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <AdminGate>{(pw) => <Dashboard pw={pw} />}</AdminGate>,
});

type Row = { id: string; code: string; name: string; created_at: string };

function Dashboard({ pw }: { pw: string }) {
  const list = useServerFn(listWrappeds);
  const del = useServerFn(deleteWrapped);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [copied, setCopied] = useState("");
  const load = useCallback(() => list({ data: { password: pw } }).then(setRows), [list, pw]);
  useEffect(() => {
    load();
  }, [load]);

  return (
    <main className="min-h-dvh bg-background px-5 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-3xl font-black">Wraps</h1>
          <Link to="/admin/new" className="btn-pill">+ New Wrapped</Link>
        </div>
        <div className="mt-8 flex flex-col gap-3">
          {rows === null && <p className="text-muted-foreground">Loading…</p>}
          {rows?.length === 0 && <p className="text-muted-foreground">No wraps yet. Make the first one!</p>}
          {rows?.map((r) => (
            <div key={r.id} className="flex items-center justify-between gap-3 rounded-2xl bg-card p-4">
              <div className="min-w-0">
                <p className="truncate font-bold">{r.name}</p>
                <p className="font-mono text-sm tracking-widest text-muted-foreground">{r.code}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  className="btn-outline-pill px-3 py-2"
                  onClick={() => {
                    navigator.clipboard.writeText(r.code);
                    setCopied(r.code);
                  }}
                  aria-label="Copy code"
                >
                  <Copy className="size-4" /> {copied === r.code ? "Copied" : "Code"}
                </button>
                <Link to="/wrapped/$code/$stage" params={{ code: r.code, stage: "0" }} className="btn-outline-pill px-3 py-2">
                  View
                </Link>
                <button
                  className="btn-outline-pill px-3 py-2"
                  aria-label="Delete"
                  onClick={async () => {
                    if (!confirm(`Delete ${r.name}'s wrapped?`)) return;
                    await del({ data: { password: pw, id: r.id } });
                    load();
                  }}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
