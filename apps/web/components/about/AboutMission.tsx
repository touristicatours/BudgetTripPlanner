export default function AboutMission() {
  return (
    <section className="px-6 md:px-12 py-12 md:py-16">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-2xl md:text-3xl font-bold">Our Mission</h2>
        <p className="mt-4 text-zinc-600 dark:text-zinc-300">
          Turn the chaos of tabs, notes, and screenshots into a single,
          living plan you can shape with AI—then book it when you’re ready.
        </p>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { title: "Speed", desc: "Lightning-fast suggestions that keep up with your ideas." },
            { title: "Clarity", desc: "One shared source of truth for friends, family, and you." },
            { title: "Delight", desc: "A playful canvas that makes planning feel like play." },
          ].map((i) => (
            <div key={i.title} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 text-left">
              <div className="text-lg font-semibold">{i.title}</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{i.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
