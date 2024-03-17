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
      name: body.name,
      address: body.address,
      contact: body.contact,
      vehicle: body.vehicle,
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
