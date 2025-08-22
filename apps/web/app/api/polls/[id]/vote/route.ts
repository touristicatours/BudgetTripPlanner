import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { optionId } = await req.json();
  const voterToken = req.headers.get("x-voter") || crypto.randomBytes(8).toString("hex");
  const vote = await prisma.vote.create({ data: { pollId: params.id, optionId, voterToken } });
  return NextResponse.json({ ok:true, vote });
}
