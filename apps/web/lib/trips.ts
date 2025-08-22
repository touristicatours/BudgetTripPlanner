// src/lib/trips.ts
import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), ".data", "trips");
const INDEX = path.join(DATA_DIR, "index.json");

export type TripDoc = {
  id: string;
  createdAt: string;
  form: any;
  itinerary: any;
};

async function ensure() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try { await fs.access(INDEX); } catch { await fs.writeFile(INDEX, "[]"); }
}

export async function saveTrip(doc: Omit<TripDoc, "id" | "createdAt">): Promise<TripDoc> {
  await ensure();
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const full: TripDoc = { id, createdAt, ...doc };
  await fs.writeFile(path.join(DATA_DIR, `${id}.json`), JSON.stringify(full, null, 2));
  const list: TripDoc[] = JSON.parse(await fs.readFile(INDEX, "utf-8"));
  list.unshift({ ...full, form: undefined, itinerary: undefined }); // light index
  await fs.writeFile(INDEX, JSON.stringify(list.slice(0, 200), null, 2));
  return full;
}

export async function getTrip(id: string): Promise<TripDoc | null> {
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, `${id}.json`), "utf-8");
    return JSON.parse(raw);
  } catch { return null; }
}
