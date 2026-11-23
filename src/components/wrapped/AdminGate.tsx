import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState, type ReactNode } from "react";
import { adminLogin } from "@/lib/wrapped.functions";
import { getAdminPw, setAdminPw } from "@/lib/admin-session";

export function AdminGate({ children }: { children: (pw: string) => ReactNode }) {
  const login = useServerFn(adminLogin);
  const [pw, setPw] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    const saved = getAdminPw();
    if (!saved) return setPw("");
    login({ data: { password: saved } }).then((r) => setPw(r.ok ? saved : ""));
  }, [login]);

  if (pw === null) return <div className="min-h-dvh bg-background" />;
  if (pw) return <>{children(pw)}</>;

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-6">
      <form
        className="w-full max-w-xs text-center"
        onSubmit={async (e) => {
          e.preventDefault();
          const r = await login({ data: { password: input } });
          if (r.ok) {
            setAdminPw(input);
            setPw(input);
          } else setError(true);
        }}
      >
        <h1 className="text-3xl font-black">Admin</h1>
        <input
          type="password"
          inputMode="numeric"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="field mt-6 text-center text-xl tracking-[0.4em]"
          aria-label="Password"
          autoFocus
        />
        {error && <p className="mt-2 text-sm text-destructive">Wrong password</p>}
        <button className="btn-pill mt-4 w-full">Enter</button>
      </form>
    </main>
  );
}
