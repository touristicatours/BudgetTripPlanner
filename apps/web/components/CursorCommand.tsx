"use client";
import { useEffect, useState } from "react";

type Props = { onCommand: (cmd: string) => void };

export default function CursorCommand({ onCommand }: Props) {
	const [open, setOpen] = useState(false);
	const [value, setValue] = useState("");

	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
				e.preventDefault();
				setOpen((v) => !v);
			}
		};
		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, []);

	const submit = () => {
		if (!value.trim()) return;
		onCommand(value.trim());
		setValue("");
		setOpen(false);
	};

	if (!open) return null;
	return (
		<div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center pt-24" onClick={() => setOpen(false)}>
			<div className="w-full max-w-2xl bg-white rounded-xl shadow-xl p-4" onClick={(e) => e.stopPropagation()}>
				<div className="text-sm text-gray-600 mb-2">Cursor Command — e.g., "add Louvre to day 2 morning" or "remove last activity day 1"</div>
				<input
					autoFocus
					value={value}
					onChange={(e) => setValue(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter") submit();
						if (e.key === "Escape") setOpen(false);
					}}
					placeholder="Type a command..."
					className="w-full border rounded-lg px-3 py-2"
				/>
				<div className="mt-3 text-right">
					<button className="px-3 py-1.5 rounded bg-indigo-600 text-white" onClick={submit}>Run</button>
				</div>
			</div>
		</div>
	);
}
