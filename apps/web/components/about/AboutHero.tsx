import Link from "next/link";

export default function AboutHero() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-800 via-zinc-900 to-black text-white px-6 py-16 md:px-12 md:py-24">
      <div className="absolute inset-0 pointer-events-none [mask-image:radial-gradient(60%_60%_at_20%_10%,#000_40%,transparent_70%)]">
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-fuchsia-500/25 blur-3xl" />
        <div className="absolute right-0 bottom-0 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
      </div>

      <div className="relative max-w-5xl">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm leading-none">
          ✨ AI trip builder • Real-time tips • Shareable plans
        </span>
        <h1 className="mt-5 text-4xl font-extrabold tracking-tight md:text-6xl">
          About TripWeaver
        </h1>
        <p className="mt-4 max-w-2xl text-zinc-200">
          We make travel planning feel as fun as the trip itself—fast,
          collaborative, and a little bit playful. Your ideas, our AI, one
          canvas.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/plan" className="rounded-xl bg-white text-black px-5 py-3 font-medium hover:bg-zinc-100">
            Plan a trip
          </Link>
          <Link href="/demo" className="rounded-xl border border-white/20 px-5 py-3 font-medium hover:bg-white/10">
            See a quick demo
          </Link>
        </div>
      </div>
    </section>
  );
}
