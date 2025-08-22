import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ ok:false, error:"file required" }, { status:400 });
  const bytes = Buffer.from(await file.arrayBuffer());
  const storedAt = `/tmp/${Date.now()}_${file.name}`;
  await import("fs/promises").then(fs => fs.writeFile(storedAt, bytes));
  const rec = await prisma.receipt.create({
    data: {
      tripId: params.id,
      filename: file.name,
      mimeType: file.type || "application/octet-stream",
      bytes: bytes.length,
      storedAt,
      kind: file.name.toLowerCase().includes("hotel") ? "stay" : undefined,
    },
  });
  return NextResponse.json({ ok:true, receipt: rec });
}
