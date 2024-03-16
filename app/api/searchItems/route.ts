import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";
import { createSearchItemSchema } from "../../validationSchemas";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const validation = createSearchItemSchema.safeParse(body);

  if (!validation.success)
    return NextResponse.json(validation.error.format(), { status: 400 });

  const newSearchItem = await prisma.searchItems.create({
    data: {
      description: body.description,
    },
  });

  return NextResponse.json(newSearchItem, { status: 201 });
}

export async function GET(request: NextRequest) {
  const searchItems = await prisma.searchItems.findMany();

  return NextResponse.json(searchItems, { status: 200 });
}
