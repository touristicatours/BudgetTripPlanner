import FlightFinder from "@/components/FlightFinder";

export default function Page() {
  const today = new Date().toISOString().slice(0,10);
  return (
    <div className="mx-auto max-w-5xl p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Flights</h1>
      <FlightFinder defaultDepart={today} />
    </div>
  );
}
