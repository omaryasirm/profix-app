import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";
import { createSearchItemSchema } from "../../../validationSchemas";
import { revalidateTag } from "next/cache";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const searchItem = await prisma.searchItems.findUnique({
    where: {
      id: parseInt(params.id),
    },
  });

  if (!searchItem)
    return NextResponse.json(
      { error: "Invalid search item" },
      { status: 404 }
    );

  return NextResponse.json(searchItem);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const validation = createSearchItemSchema.safeParse(body);

  if (!validation.success)
    return NextResponse.json(validation.error.format(), { status: 400 });

  const searchItem = await prisma.searchItems.findUnique({
    where: { id: parseInt(params.id) },
  });

  if (!searchItem)
    return NextResponse.json(
      { error: "Invalid search item" },
      { status: 404 }
    );

  const updatedSearchItem = await prisma.searchItems.update({
    where: { id: searchItem.id },
    data: {
      description: body.description,
    },
  });

  revalidateTag("searchItems");

  return NextResponse.json(updatedSearchItem);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const searchItemId = parseInt(params.id);

  const searchItem = await prisma.searchItems.findUnique({
    where: { id: searchItemId },
  });

  if (!searchItem)
    return NextResponse.json(
      { error: "Invalid search item" },
      { status: 404 }
    );

  await prisma.searchItems.delete({
    where: { id: searchItemId },
  });

  revalidateTag("searchItems");

  return NextResponse.json({ message: "Search item deleted successfully" });
}
