import { createCustomerSchema } from "@/app/validationSchemas";
import prisma from "@/prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const customer = await prisma.customer.findUnique({
    where: {
      id: parseInt(params.id),
    },
    include: {
      invoices: {
        orderBy: { updatedAt: "desc" },
        take: 10,
        select: {
          id: true,
          type: true,
          total: true,
          createdAt: true,
        },
      },
    },
  });

  if (!customer)
    return NextResponse.json({ error: "Invalid customer" }, { status: 404 });

  return NextResponse.json(customer);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const validation = createCustomerSchema.safeParse(body);

  if (!validation.success)
    return NextResponse.json(validation.error.format(), { status: 400 });

  const customer = await prisma.customer.findUnique({
    where: { id: parseInt(params.id) },
  });

  if (!customer)
    return NextResponse.json({ error: "Invalid customer" }, { status: 404 });

  const updatedCustomer = await prisma.customer.update({
    where: { id: customer.id },
    data: {
      name: body.name,
      contact: body.contact,
      vehicle: body.vehicle,
      registrationNo: body.registrationNo,
    },
  });

  revalidateTag("customers");

  return NextResponse.json(updatedCustomer);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const customerId = parseInt(params.id);

  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: {
      invoices: {
        take: 1,
      },
    },
  });

  if (!customer)
    return NextResponse.json({ error: "Invalid customer" }, { status: 404 });

  if (customer.invoices.length > 0) {
    return NextResponse.json(
      {
        error:
          "Cannot delete customer with existing invoices. Please delete or reassign invoices first.",
      },
      { status: 400 }
    );
  }

  await prisma.customer.delete({
    where: { id: customerId },
  });

  revalidateTag("customers");

  return NextResponse.json({ message: "Customer deleted successfully" });
}
