import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";
import { createCustomerSchema } from "../../validationSchemas";
import { unstable_cache } from "next/cache";
import { revalidateTag } from "next/cache";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const validation = createCustomerSchema.safeParse(body);

  if (!validation.success) {
    console.log(validation.error.format());
    return NextResponse.json(validation.error.format(), { status: 400 });
  }

  const newCustomer = await prisma.customer.create({
    data: {
      name: body.name,
      contact: body.contact,
      vehicle: body.vehicle,
      registrationNo: body.registrationNo,
    },
  });

  revalidateTag("customers");

  return NextResponse.json(newCustomer, { status: 201 });
}

const getCachedCustomers = unstable_cache(
  async (search: string, page: number, limit: number) => {
    const skip = (page - 1) * limit;
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { contact: { contains: search, mode: "insensitive" as const } },
            { vehicle: { contains: search, mode: "insensitive" as const } },
            {
              registrationNo: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {};

    const [data, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: "desc" },
        distinct: ["name", "contact"],
      }),
      prisma.customer.count({ where }),
    ]);

    return { data, total };
  },
  ["customers"],
  { revalidate: 60, tags: ["customers"] }
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  const { data, total } = await getCachedCustomers(search, page, limit);

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
