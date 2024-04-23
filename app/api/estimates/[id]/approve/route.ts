import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  // const validation = createInvoiceSchema.safeParse(body);

  // if (!validation.success)
  //   return NextResponse.json(validation.error.format(), { status: 400 });

  const invoice = await prisma.invoice.findUnique({
    where: { id: parseInt(params.id) },
  });

  if (!invoice)
    return NextResponse.json({ error: "Invalid invoice" }, { status: 404 });

  const updatedInvoice = await prisma.invoice.update({
    where: { id: invoice.id },
    data: {
      type: "INVOICE",
      paymentMethod: body.paymentMethod,
      paymentAccount: body.paymentAccount,
    },
  });

  return NextResponse.json(updatedInvoice);
}
