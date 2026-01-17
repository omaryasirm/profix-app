import { createInvoiceSchema } from "@/app/validationSchemas";
import prisma from "@/prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const invoice = await prisma.invoice.findUnique({
    where: {
      id: parseInt(params.id),
    },
    include: {
      items: true,
      customer: true,
    },
  });

  if (!invoice)
    return NextResponse.json({ error: "Invalid invoice" }, { status: 404 });

  return NextResponse.json(invoice);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const validation = createInvoiceSchema.safeParse(body);

  if (!validation.success)
    return NextResponse.json(validation.error.format(), { status: 400 });

  const invoice = await prisma.invoice.findUnique({
    where: { id: parseInt(params.id) },
  });

  if (!invoice)
    return NextResponse.json({ error: "Invalid invoice" }, { status: 404 });

  const updatedInvoice = await prisma.invoice.update({
    where: { id: invoice.id },
    data: {
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
      items: {
        deleteMany: {},
        create: body.items,
      },
    },
  });

  return NextResponse.json(updatedInvoice);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: parseInt(params.id) },
  });

  if (!invoice)
    return NextResponse.json({ error: "Invalid invoice" }, { status: 404 });

  // Delete associated items first, then the invoice
  await prisma.item.deleteMany({
    where: { invoiceId: invoice.id },
  });

  await prisma.invoice.delete({
    where: { id: invoice.id },
  });

  return NextResponse.json({ message: "Invoice deleted successfully" });
}
