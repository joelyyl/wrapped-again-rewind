import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { WrappedData } from "./wrapped-logic";

const BUCKET = "wrapped-media";

async function checkPassword(input: string) {
  const { createHash, timingSafeEqual } = await import("node:crypto");
  const expected = process.env["ADMIN_PASSWORD"] ?? "";
  const a = createHash("sha256").update(input).digest();
  const b = createHash("sha256").update(expected).digest();
  if (!expected || !timingSafeEqual(a, b)) throw new Error("Wrong password");
}

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

const pw = z.object({ password: z.string().max(100) });

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => pw.parse(d))
  .handler(async ({ data }) => {
    try {
      await checkPassword(data.password);
      return { ok: true };
    } catch {
      return { ok: false };
    }
  });

export const listWrappeds = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => pw.parse(d))
  .handler(async ({ data }) => {
    await checkPassword(data.password);
    const db = await admin();
    const { data: rows, error } = await db
      .from("wrappeds")
      .select("id, code, name, created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return rows;
  });

export const deleteWrapped = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => pw.extend({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    await checkPassword(data.password);
    const db = await admin();
    const { error } = await db.from("wrappeds").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getUploadUrl = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    pw.extend({ ext: z.string().regex(/^[a-z0-9]{1,5}$/) }).parse(d),
  )
  .handler(async ({ data }) => {
    await checkPassword(data.password);
    const db = await admin();
    const path = `${crypto.randomUUID()}.${data.ext}`;
    const { data: signed, error } = await db.storage.from(BUCKET).createSignedUploadUrl(path);
    if (error) throw new Error(error.message);
    return { path, token: signed.token };
  });

const s = (max: number) => z.string().trim().max(max);
const n = z.coerce.number().int().min(0).max(100_000_000);
const file = z.string().max(200).nullable();

const wrappedSchema = z.object({
  greeting: s(30),
  avatar: file,
  knownSince: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  animalEmoji: s(16),
  animalName: s(60),
  job: s(80),
  personality: s(60),
  messages2026: n,
  messages2025: n,
  hours2026: n,
  streak: n,
  funny: z.object({ type: z.enum(["image", "joke", "quote"]), text: s(500), image: file }),
  phrase: s(200),
  achievements: z.array(s(200)).min(1).max(5),
  awards: z
    .array(z.object({ type: z.enum(["trophy", "chocolate", "medal", "diamond", "emerald"]), text: s(120) }))
    .min(1)
    .max(5),
  song: z.object({ title: s(120), artist: s(120), cover: file, audio: file }),
  favourite: file,
});

export const createWrapped = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    pw.extend({ name: s(60).min(1), wrapped: wrappedSchema }).parse(d),
  )
  .handler(async ({ data }) => {
    await checkPassword(data.password);
    const db = await admin();
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    for (let attempt = 0; attempt < 5; attempt++) {
      const bytes = crypto.getRandomValues(new Uint8Array(6));
      const code = [...bytes].map((b) => alphabet[b % alphabet.length]).join("");
      const { error } = await db
        .from("wrappeds")
        .insert({ code, name: data.name, data: data.wrapped });
      if (!error) return { code };
      if (!error.message.includes("duplicate")) throw new Error(error.message);
    }
    throw new Error("Could not create a unique code");
  });

export const getWrapped = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ code: z.string().trim().toUpperCase().max(12) }).parse(d))
  .handler(async ({ data }) => {
    const db = await admin();
    const { data: row } = await db
      .from("wrappeds")
      .select("code, name, data")
      .eq("code", data.code)
      .maybeSingle();
    if (!row) return null;
    const w = row.data as unknown as WrappedData;
    const paths = [w.avatar, w.funny?.image, w.song?.cover, w.song?.audio, w.favourite].filter(
      (p): p is string => !!p,
    );
    const urls: Record<string, string> = {};
    if (paths.length) {
      const { data: signed } = await db.storage.from(BUCKET).createSignedUrls(paths, 60 * 60 * 24);
      for (const sItem of signed ?? []) if (sItem.path && sItem.signedUrl) urls[sItem.path] = sItem.signedUrl;
    }
    const u = (p: string | null | undefined) => (p ? (urls[p] ?? null) : null);
    const resolved: WrappedData = {
      ...w,
      avatar: u(w.avatar),
      favourite: u(w.favourite),
      funny: { ...w.funny, image: u(w.funny.image) },
      song: { ...w.song, cover: u(w.song.cover), audio: u(w.song.audio) },
    };
    return { code: row.code, name: row.name, data: resolved };
  });

export const checkCode = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ code: z.string().trim().toUpperCase().max(12) }).parse(d))
  .handler(async ({ data }) => {
    const db = await admin();
    const { data: row } = await db.from("wrappeds").select("code").eq("code", data.code).maybeSingle();
    return { exists: !!row };
  });
