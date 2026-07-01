// app/api/shows/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withStaffSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const upcoming = searchParams.get("upcoming") === "true";

  const shows = await prisma.show.findMany({
    where: {
      published: true,
      ...(upcoming && { date: { gte: new Date() } }),
    },
    orderBy: { date: "asc" },
  });
  return NextResponse.json(shows);
}

const ShowSchema = z.object({
  date:       z.string().datetime(),
  venueName:  z.string().min(1),
  city:       z.string().min(1),
  country:    z.string().min(1),
  ticketUrl:  z.string().url().optional(),
  soldOut:    z.boolean().default(false),
  published:  z.boolean().default(true),
});

export function POST(req: NextRequest) {
  return withStaffSession(req, ["ADMIN", "EDITOR"], async () => {
    const body = ShowSchema.safeParse(await req.json());
    if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 400 });

    const show = await prisma.show.create({
      data: { ...body.data, date: new Date(body.data.date) },
    });
    return NextResponse.json(show, { status: 201 });
  });
}
