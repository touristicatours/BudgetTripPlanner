// Server component
import { getTrip } from "@/lib/trips";
import EnhancedItineraryViewer from "@/src/components/EnhancedItineraryViewer";
import DuplicateTripButton from "@/components/DuplicateTripButton";
import dynamic from "next/dynamic";
import Link from "next/link";

const TabbedEnhancements = dynamic(() => import("../../trips/[id]/TabbedEnhancements"), {
  ssr: false,
  loading: () => <div className="mt-8 p-4 text-center">Loading enhancements...</div>
});

const Enhancements = dynamic(() => import("../../trips/[id]/Enhancements"), {
  ssr: false,
  loading: () => <div className="mt-8 p-4 text-center">Loading enhancements...</div>
});

export default async function Page({ params }: { params: { id: string } }) {
  const trip = await getTrip(params.id);
  if (!trip) return <div className="mx-auto max-w-3xl p-6">Not found. <Link className="text-indigo-600" href="/plan">Back to planner</Link></div>;
  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Trip • {trip.form?.destination}</h1>
        <div className="flex items-center gap-2">
          <DuplicateTripButton tripId={params.id} />
          <Link 
            className="px-4 py-2 rounded border bg-white hover:bg-gray-50" 
            href={`/trips/${params.id}/export`}
          >
            Export PDF
          </Link>
          <Link 
            className="px-4 py-2 rounded border bg-green-600 text-white hover:bg-green-700" 
            href={`/trip/${params.id}/execution`}
          >
            🚀 Start Execution Mode
          </Link>
          <Link className="text-indigo-600" href="/plan">Back to planner</Link>
        </div>
      </div>
      <EnhancedItineraryViewer form={trip.form} itinerary={trip.itinerary} tripId={trip.id} />
      
      {/* Tabbed Enhancements */}
      <div className="mt-8">
        <TabbedEnhancements id={trip.id} />
      </div>
    </div>
  );
}
