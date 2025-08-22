"use client";
import { useEffect, useState } from "react";
import jsPDF from "jspdf";

type CodeFile = { path: string; content: string; bytes: number };

export default function CodeExportPage() {
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<CodeFile[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function fetchFiles() {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/export/code");
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Failed to fetch");
      setFiles(j.files || []);
    } catch (e:any) {
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchFiles(); }, []);

  function downloadPDF() {
    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 36;
    let y = margin;

    const write = (text: string, isHeader = false) => {
      const lines = pdf.splitTextToSize(text, pageWidth - margin * 2);
      for (const line of lines) {
        if (y > pdf.internal.pageSize.getHeight() - margin) {
          pdf.addPage(); y = margin;
        }
        if (isHeader) pdf.setFont(undefined, "bold"); else pdf.setFont(undefined, "normal");
        pdf.text(line, margin, y);
        y += 14;
      }
      y += 8;
    };

    pdf.setFontSize(12);
    write("BudgetTripPlanner Code Export", true);
    write(new Date().toISOString());
    y += 10;

    files.forEach((f) => {
      write(`FILE: ${f.path}`, true);
      write(f.content || "\n");
      y += 6;
    });

    pdf.save("BudgetTripPlanner-code.pdf");
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-semibold mb-2">Code Export</h1>
      <p className="text-sm text-gray-600 mb-4">Preview and export source files as a single PDF.</p>
      <div className="flex items-center gap-2 mb-4">
        <button className="px-3 py-2 rounded bg-indigo-600 text-white" onClick={fetchFiles} disabled={loading}>
          {loading ? "Loading..." : "Refresh"}
        </button>
        <button className="px-3 py-2 rounded border" onClick={downloadPDF} disabled={!files.length}>
          Download PDF
        </button>
        <span className="text-sm text-gray-600">{files.length} files</span>
      </div>
      {error && <div className="text-red-600 text-sm mb-4">{error}</div>}
      <div className="bg-white border rounded overflow-hidden">
        <div className="max-h-[60vh] overflow-auto p-4 text-xs font-mono whitespace-pre-wrap">
          {files.map((f) => (
            <div key={f.path} className="mb-6">
              <div className="font-semibold mb-1">{f.path}</div>
              <pre>{f.content}</pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


