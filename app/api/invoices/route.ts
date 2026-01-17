import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";
import { createInvoiceSchema } from "../../validationSchemas";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const validation = createInvoiceSchema.safeParse(body);

  if (!validation.success) {
    console.log(validation.error.format());
    return NextResponse.json(validation.error.format(), { status: 400 });
  }

  const newInvoice = await prisma.invoice.create({
    data: {
      customerId: body.customerId,
      name: body.name,
      contact: body.contact,
      vehicle: body.vehicle,
      registrationNo: body.registrationNo,
      paymentMethod: body.paymentMethod,
      paymentAccount: body.paymentAccount,
      subtotal: body.subtotal,
      tax: body.tax,
      discount: body.discount,
      total: body.total,
      items: { create: body.items },
    },
    include: {
      items: true,
    },
  });

  return NextResponse.json(newInvoice, { status: 201 });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const type = searchParams.get("type") || "INVOICE";
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    prisma.invoice.findMany({
      where: { type: type as "INVOICE" | "ESTIMATE" },
      skip,
      take: limit,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.invoice.count({
      where: { type: type as "INVOICE" | "ESTIMATE" },
    }),
  ]);

  return NextResponse.json({
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
