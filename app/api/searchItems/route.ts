import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";
import { createSearchItemSchema } from "../../validationSchemas";
import { unstable_cache } from "next/cache";
import { revalidateTag } from "next/cache";

const getCachedSearchItems = unstable_cache(
  async (search: string, page: number, limit: number) => {
    const skip = (page - 1) * limit;
    const where = search
      ? {
          description: {
            contains: search,
            mode: "insensitive" as const,
          },
        }
      : {};

    const [data, total] = await Promise.all([
      prisma.searchItems.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        distinct: ["description"],
      }),
      prisma.searchItems.count({ where }),
    ]);

    return { data, total };
  },
  ["searchItems"],
  { revalidate: 60, tags: ["searchItems"] }
);

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

  revalidateTag("searchItems");

  return NextResponse.json(newSearchItem, { status: 201 });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  const { data, total } = await getCachedSearchItems(search, page, limit);

  const response = NextResponse.json({
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });

  response.headers.set(
    "Cache-Control",
    "public, s-maxage=60, stale-while-revalidate=300"
  );

  return response;
}
