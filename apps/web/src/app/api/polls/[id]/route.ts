import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const poll = await prisma.poll.findUnique({ where: { id: params.id }, include: { votes:true } });
  if (!poll) return NextResponse.json({ ok:false, error:"Not found" }, { status:404 });
  return NextResponse.json({ ok:true, poll });
}
