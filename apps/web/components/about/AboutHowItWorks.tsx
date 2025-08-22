const STEPS = [
  { emoji: "📝", title: "Describe your trip", copy: "Tell us where, when, budget, and vibe. Or paste notes—your choice." },
  { emoji: "🧠", title: "Co-create with AI", copy: "Add, remove, or remix. The canvas updates instantly—no rigid forms." },
  { emoji: "✅", title: "Lock & book", copy: "Share a link, collect votes, export or book when ready." },
];

export default function AboutHowItWorks() {
  return (
    <section className="px-6 md:px-12 py-12 md:py-16">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-2xl md:text-3xl font-bold text-center">How it works</h2>
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.title} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
              <div className="text-3xl">{s.emoji}</div>
              <div className="mt-3 text-lg font-semibold">{s.title}</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{s.copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
