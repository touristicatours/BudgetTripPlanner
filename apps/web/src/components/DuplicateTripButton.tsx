"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface DuplicateTripButtonProps {
  tripId: string;
  className?: string;
}

export default function DuplicateTripButton({ tripId, className = "" }: DuplicateTripButtonProps) {
  const [isDuplicating, setIsDuplicating] = useState(false);
  const router = useRouter();

  const handleDuplicate = async () => {
    setIsDuplicating(true);
    try {
      const response = await fetch(`/api/trips/${tripId}/duplicate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const { trip } = await response.json();
        router.push(`/trip/${trip.id}`);
      } else {
        const error = await response.json();
        alert(`Failed to duplicate trip: ${error.error}`);
      }
    } catch (error) {
      console.error("Error duplicating trip:", error);
      alert("Failed to duplicate trip. Please try again.");
    } finally {
      setIsDuplicating(false);
    }
  };

  return (
    <button
      onClick={handleDuplicate}
      disabled={isDuplicating}
      className={`px-4 py-2 rounded-md border bg-white hover:bg-gray-50 disabled:opacity-50 ${className}`}
    >
      {isDuplicating ? "Duplicating..." : "Duplicate Trip"}
    </button>
  );
}
