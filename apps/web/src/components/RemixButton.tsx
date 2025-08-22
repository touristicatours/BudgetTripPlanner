"use client";
import { useRouter } from "next/navigation";

export default function RemixButton({ id }: { id: string }) {
  const r = useRouter();
  async function go() {
    const resp = await fetch(`/api/trips/${id}/duplicate`, { method: "POST" });
    const j = await resp.json();
    if (j?.trip?.id) r.push(`/trips/${j.trip.id}`);
  }
  return (
    <button onClick={go} className="px-3 py-2 rounded bg-black text-white">
      Remix this trip
    </button>
  );
}
