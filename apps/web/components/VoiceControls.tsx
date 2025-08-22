"use client";
import { useEffect, useRef, useState } from "react";

type Props = {
	onTranscript?: (text: string) => void;
};

export default function VoiceControls({ onTranscript }: Props) {
	const [recording, setRecording] = useState(false);
	const recogRef = useRef<any>(null);

	useEffect(() => {
		if (typeof window === "undefined") return;
		const SR: any = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
		if (!SR) return;
		const recog = new SR();
		recog.continuous = true;
		recog.interimResults = true;
		recog.lang = "en-US";
		recog.onresult = (e: any) => {
			let finalText = "";
			for (let i = e.resultIndex; i < e.results.length; i++) {
				if (e.results[i].isFinal) finalText += e.results[i][0].transcript;
			}
			if (finalText && onTranscript) onTranscript(finalText.trim());
		};
		recog.onend = () => setRecording(false);
		recogRef.current = recog;
	}, [onTranscript]);

	const start = () => {
		try {
			recogRef.current?.start();
			setRecording(true);
		} catch {}
	};
	const stop = () => {
		try {
			recogRef.current?.stop();
			setRecording(false);
		} catch {}
	};

	const speak = (text: string) => {
		if (typeof window === "undefined") return;
		const utter = new SpeechSynthesisUtterance(text);
		utter.rate = 1.0;
		utter.pitch = 1.0;
		window.speechSynthesis.cancel();
		window.speechSynthesis.speak(utter);
	};

	if (typeof window !== "undefined") (window as any).voiceSpeak = speak;

	return (
		<div className="flex items-center gap-2">
			<button
				className={`px-3 py-1.5 rounded ${recording ? "bg-red-600" : "bg-gray-800"} text-white`}
				onClick={recording ? stop : start}
			>
				{recording ? "Stop" : "Voice In"}
			</button>
			<button className="px-3 py-1.5 rounded border" onClick={() => speak("Ready to plan your trip.")}>Voice Out</button>
		</div>
	);
}
