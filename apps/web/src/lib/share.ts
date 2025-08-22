// src/lib/share.ts
import LZString from "lz-string";

export function compressToParam(obj: unknown) {
  const json = JSON.stringify(obj);
  return LZString.compressToEncodedURIComponent(json);
}

export function decompressFromParam(param: string) {
  try {
    const json = LZString.decompressFromEncodedURIComponent(param);
    return json ? JSON.parse(json) : null;
  } catch {
    return null;
  }
}

export async function copy(text: string) {
  await navigator.clipboard.writeText(text);
}

export function downloadJSON(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
