// Decorative stepped ribbons, inspired by the 2023 Wrapped look. Only used inside stories.
const LAYOUTS = [
  [
    "-top-24 -left-20 h-72 w-[140%] [--r:-14deg]",
    "-bottom-28 -right-24 h-72 w-[140%] [--r:-14deg]",
  ],
  [
    "-top-10 -right-32 h-56 w-[120%] [--r:22deg]",
    "-bottom-16 -left-32 h-64 w-[120%] [--r:22deg]",
  ],
  [
    "top-0 -left-40 h-48 w-[90%] [--r:-35deg]",
    "-bottom-24 -right-10 h-80 w-[100%] [--r:-8deg]",
  ],
];

export function Art({ variant }: { variant: number }) {
  const layout = LAYOUTS[variant % LAYOUTS.length]!;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {layout.map((cls, i) => (
        <div
          key={i}
          className={`wrapped-ribbon animate-drift absolute rounded-[2.5rem] opacity-90 ${cls}`}
          style={{ animationDelay: `${i * -3}s`, transform: "rotate(var(--r))", maskImage: "linear-gradient(to bottom, black 55%, transparent)" }}
        />
      ))}
    </div>
  );
}
