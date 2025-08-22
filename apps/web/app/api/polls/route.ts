import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const { tripId, title, options } = await req.json();
  const poll = await prisma.poll.create({
    data: {
      tripId,
      title,
      options: JSON.stringify(options), // Convert array to JSON string
      publicToken: crypto.randomBytes(9).toString("base64url"),
    },
  });
  return NextResponse.json({ ok:true, poll });
}
