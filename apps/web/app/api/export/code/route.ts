import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

type CodeFile = { path: string; content: string; bytes: number };

const ALLOWED_EXTS = new Set([".ts", ".tsx", ".js", ".jsx", ".json", ".md", ".css"]);
const IGNORE_DIRS = new Set(["node_modules", ".next", ".git", "dist", "build", ".turbo", "out", ".data", "public"]);

function isIgnoredDir(p: string) {
  const parts = p.split(path.sep);
  return parts.some((seg) => IGNORE_DIRS.has(seg));
}

function collectFiles(root: string, subdir: string, maxFiles: number, maxBytesPerFile: number, out: CodeFile[]) {
  const dir = path.join(root, subdir);
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (out.length >= maxFiles) return;
    const rel = path.join(subdir, entry.name);
    const full = path.join(root, rel);
    if (entry.isDirectory()) {
      if (isIgnoredDir(rel)) continue;
      collectFiles(root, rel, maxFiles, maxBytesPerFile, out);
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      if (!ALLOWED_EXTS.has(ext)) continue;
      try {
        const buf = fs.readFileSync(full);
        const content = buf.toString("utf8");
        const truncated = content.length > maxBytesPerFile ? content.slice(0, maxBytesPerFile) + "\n/* Truncated */\n" : content;
        out.push({ path: rel, content: truncated, bytes: content.length });
      } catch {
        // skip unreadable files
      }
    }
  }
}

export async function GET() {
  try {
    const root = process.cwd(); // apps/web
    const targets = ["app", "src", "components", "lib", "types"];
    const files: CodeFile[] = [];
    for (const t of targets) {
      collectFiles(root, t, 400, 200_000, files);
      if (files.length >= 400) break;
    }
    files.sort((a,b)=> a.path.localeCompare(b.path));
    return NextResponse.json({ count: files.length, files });
  } catch (e:any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}


