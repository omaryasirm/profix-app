import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";
import { createCustomerSchema } from "../../validationSchemas";

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

  return NextResponse.json(newCustomer, { status: 201 });
}
