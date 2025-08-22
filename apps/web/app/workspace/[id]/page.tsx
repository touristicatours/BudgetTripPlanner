"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import CursorCommand from "@/components/CursorCommand";
import VoiceControls from "@/components/VoiceControls";

type Trip = { id: string; form: any; itinerary: any[] };

export default function WorkspacePage() {
	const params = useParams();
	const id = String(params.id || "");
	const [trip, setTrip] = useState<Trip | null>(null);
	const [loading, setLoading] = useState(true);
	const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
	const [input, setInput] = useState("");
	const [selected, setSelected] = useState<{ dayIndex: number; activityIndex?: number } | null>(null);
	const [undo, setUndo] = useState<{ itinerary: any[] } | null>(null);
	const [showSaved, setShowSaved] = useState(false);

	useEffect(() => {
		if (!id) return;
		(async () => {
			try {
				const j = await fetch(`/api/trips/db/${id}`).then(r => r.json());
				setTrip(j);
			} finally {
				setLoading(false);
			}
		})();
	}, [id]);

	const days = useMemo(() => trip?.itinerary || [], [trip]);

	const send = async (text: string) => {
		const content = text.trim();
		if (!content) return;
		setMessages(m => [...m, { role: "user", content }]);
		setInput("");
		try {
			const res = await fetch("/api/ai/chat", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ messages: [{ role: "user", content }] }),
			});
			const j = await res.json();
			const reply = j?.content || "Okay.";
			setMessages(m => [...m, { role: "assistant", content: reply }]);
			(window as any).voiceSpeak?.(reply);
		} catch {
			setMessages(m => [...m, { role: "assistant", content: "Processing..." }]);
		}
	};

	async function saveItinerary(next: any[]) {
		if (!trip) return;
		// keep snapshot for undo
		setUndo({ itinerary: trip.itinerary });
		setShowSaved(true);
		// optimistic update
		setTrip({ ...trip, itinerary: next });
		await fetch(`/api/trips/db/${trip.id}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ itinerary: next })
		});
	}

	async function applyCommand(cmd: string) {
		if (!trip) return;
		const text = cmd.toLowerCase();

		// 1) Make this cheaper
		if (/make (this )?cheaper/.test(text) && selected?.activityIndex !== undefined) {
			const d = selected.dayIndex, a = selected.activityIndex;
			const next = [...trip.itinerary];
			const day = { ...(next[d] || {}), activities: [ ...(next[d]?.activities || []) ] };
			const act = { ...(day.activities[a] || {}) };
			act.name = `${act.name} (budget)`;
			act.note = act.note ? `${act.note} • Cheaper option requested` : "Cheaper option requested";
			day.activities[a] = act; next[d] = day;
			await saveItinerary(next);
			setMessages(m => [...m, { role: "assistant", content: "Switched to a budget-friendly option." }]);
			return;
		}

		// 2) Add relaxing activity here
		if (/add .*relax|add .*spa|add .*park|relaxing activity here/.test(text) && selected) {
			const d = selected.dayIndex;
			const next = [...trip.itinerary];
			const day = { ...(next[d] || { title: `Day ${d + 1} • ${trip.form.destination}`, activities: [] }) };
			day.activities = [ ...(day.activities || []), { timeOfDay: "afternoon", name: "Spa or park walk", note: "Added via command" } ];
			next[d] = day;
			await saveItinerary(next);
			setMessages(m => [...m, { role: "assistant", content: "Added a relaxing afternoon activity." }]);
			return;
		}

		// 3) How much time should I budget here?
		if (/how much time/.test(text) && selected?.activityIndex !== undefined) {
			setMessages(m => [...m, { role: "assistant", content: "Typical duration: 2–3 hours for this activity." }]);
			return;
		}

		// Fallback generic add
		const addMatch = text.match(/add (.+) to day (\d+)(?: (morning|afternoon|evening|night))?/i);
		if (addMatch) {
			const name = addMatch[1];
			const dayNum = Math.max(1, parseInt(addMatch[2]));
			const slot = (addMatch[3] || "afternoon").toLowerCase();
			const idx = Math.min((trip.itinerary?.length || 1) - 1, dayNum - 1);
			const next = [...(trip.itinerary || [])];
			const day = { ...(next[idx] || { title: `Day ${idx + 1} • ${trip.form.destination}`, activities: [] }) };
			day.activities = [...(day.activities || []), { timeOfDay: slot, name, note: "Added via Command" }];
			next[idx] = day;
			await saveItinerary(next);
			setMessages(m => [...m, { role: "assistant", content: `Added ${name} to day ${dayNum} (${slot}).` }]);
			return;
		}

		setMessages(m => [...m, { role: "assistant", content: "Try: “make this cheaper”, “add relaxing activity here”, or “how much time should I budget?”" }]);
	}

	const context = selected?.activityIndex !== undefined
		? { type: "activity" as const, dayIndex: selected.dayIndex, activityIndex: selected.activityIndex, label: days[selected.dayIndex]?.activities?.[selected.activityIndex]?.name }
		: selected
		? { type: "day" as const, dayIndex: selected.dayIndex, label: days[selected.dayIndex]?.title }
		: null;

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="max-w-6xl mx-auto p-4">
				<div className="flex items-center justify-between mb-3">
					<div>
						<h1 className="text-xl font-semibold">Workspace • {trip?.form?.destination || "..."}</h1>
						<p className="text-sm text-gray-600">Cmd/Ctrl+K for Cursor Command • Click items to target</p>
					</div>
					<VoiceControls mode="button" onTranscript={(t) => send(t)} />
				</div>

				{/* Action bar */}
				{trip && (
					<div className="sticky top-16 z-40 mb-3 flex items-center justify-between rounded-lg border bg-white px-3 py-2">
						<div className="text-sm text-gray-600">Destination: <span className="font-medium text-gray-900">{trip.form.destination}</span></div>
						<div className="flex items-center gap-2">
							<a href={`/trips/${trip.id}/export`} className="px-3 py-1.5 rounded border text-sm">Export PDF</a>
							<a href={`/share/${trip.id}`} className="px-3 py-1.5 rounded border text-sm">Share link</a>
							<a href={`/trips/${trip.id}`} className="px-3 py-1.5 rounded border text-sm">Open Trip</a>
						</div>
					</div>
				)}

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{/* Chat / Canvas */}
					<div className="bg-white rounded-xl border p-4 min-h-[70vh] flex flex-col">
						<div className="flex-1 overflow-auto space-y-3">
							{messages.map((m, i) => (
								<div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
									<div className={`inline-block px-3 py-2 rounded-lg ${m.role === "user" ? "bg-indigo-600 text-white" : "bg-gray-100"}`}>{m.content}</div>
								</div>
							))}
							{loading && (
								<div className="space-y-2">
									<div className="h-4 w-3/5 bg-gray-100 animate-pulse rounded" />
									<div className="h-4 w-2/5 bg-gray-100 animate-pulse rounded" />
								</div>
							)}
						</div>
						<div className="mt-3 flex items-center gap-2">
							<input
								value={input}
								onChange={(e) => setInput(e.target.value)}
								onKeyDown={(e) => { if (e.key === "Enter") send(input); }}
								placeholder="Ask or instruct... (Enter to send)"
								className="flex-1 border rounded-lg px-3 py-2"
							/>
							<VoiceControls mode="icon" title="Dictate" onTranscript={(t) => send(t)} />
							<button className="px-3 py-2 rounded bg-indigo-600 text-white" onClick={() => send(input)}>Send</button>
						</div>
					</div>

					{/* Itinerary */}
					<div className="bg-white rounded-xl border p-4 min-h-[70vh]">
						<h3 className="font-semibold mb-2">Itinerary</h3>
						<div className="space-y-4">
							{loading && (
								<div className="space-y-3">
									<div className="h-6 w-40 bg-gray-100 animate-pulse rounded" />
									{Array.from({ length: 3 }).map((_, k) => (
										<div key={k} className="h-12 bg-gray-50 border rounded-lg animate-pulse" />
									))}
								</div>
							)}
							{!loading && days.map((d: any, i: number) => (
								<div key={i} className={`border rounded-lg ${selected?.dayIndex === i && selected?.activityIndex === undefined ? "ring-2 ring-indigo-200" : ""}`}>
									<button
										type="button"
										onClick={() => setSelected({ dayIndex: i })}
										className="w-full text-left px-3 py-2 font-medium bg-gray-50 rounded-t-lg hover:bg-gray-100"
									>
										{d.title || `Day ${i + 1}`}
									</button>
									<div className="p-3 space-y-2">
										{(d.activities || []).map((a: any, j: number) => {
											const active = selected?.dayIndex === i && selected?.activityIndex === j;
											return (
												<button
													type="button"
													key={j}
													onClick={() => setSelected({ dayIndex: i, activityIndex: j })}
													className={`w-full text-left flex gap-2 text-sm border rounded-lg px-3 py-2 hover:bg-gray-50 ${active ? "ring-2 ring-indigo-300 bg-indigo-50/40" : "bg-white"}`}
												>
													<span className="text-gray-500 w-20">{a.timeOfDay || ""}</span>
													<span className="font-medium">{a.name}</span>
													{a.note && <span className="text-gray-500">— {a.note}</span>}
												</button>
											);
										})}
										{(!d.activities || d.activities.length === 0) && (
											<div className="text-sm text-gray-500">No activities yet.</div>
										)}
									</div>
								</div>
							))}
						</div>
						{selected && (
							<div className="mt-4 flex flex-wrap gap-2">
								<button className="px-3 py-1.5 text-sm rounded border" onClick={() => applyCommand("make this cheaper")}>Make this cheaper</button>
								<button className="px-3 py-1.5 text-sm rounded border" onClick={() => applyCommand("add relaxing activity here")}>Add relaxing activity</button>
								{selected.activityIndex !== undefined && (
									<button className="px-3 py-1.5 text-sm rounded border" onClick={() => applyCommand("how much time should I budget here")}>Duration?</button>
								)}
							</div>
						)}
					</div>
				</div>
			</div>

			<CursorCommand context={context as any} onCommand={applyCommand} />

			{/* Undo banner */}
			{undo && (
				<div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
					<div className="bg-gray-900 text-white px-4 py-2 rounded-lg shadow flex items-center gap-3">
						<span>Changes saved.</span>
						<button
							className="px-3 py-1 rounded bg-white/10 hover:bg-white/20"
							onClick={async ()=>{
								if (!trip || !undo) return;
								const prev = undo.itinerary;
								setUndo(null);
								await saveItinerary(prev);
							}}
						>
							Undo
						</button>
						<button className="px-2 py-1 rounded bg-white/10 hover:bg-white/20" onClick={()=>setUndo(null)}>Dismiss</button>
					</div>
				</div>
			)}
		</div>
	);
}
