const VALUES = [
  { name: "User-first", text: "We design for clarity, not clicks. Fewer steps, better results." },
  { name: "Trust", text: "Transparent pricing and sources. Your data stays yours." },
  { name: "Play", text: "Planning should feel creative—drag, drop, remix, repeat." },
  { name: "Speed", text: "Fast by default. The app should never slow your ideas." },
];

export default function AboutValues() {
  return (
    <section className="px-6 md:px-12 py-12 md:py-16">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-2xl md:text-3xl font-bold text-center">Values we ship with</h2>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {VALUES.map((v) => (
            <div key={v.name} className="rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6">
              <div className="text-lg font-semibold">{v.name}</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{v.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
