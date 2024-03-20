import React from "react";
import prisma from "@/prisma/client";
import TablePage from "../_pages/TablePage";

const InvoicesPage = async () => {
  const invoices = await prisma.invoice.findMany({
    where: { type: { in: ["INVOICE"] } },
    orderBy: [{ updatedAt: "desc" }],
  });

  return <TablePage invoices={invoices} />;
};

export const dynamic = "force-dynamic";
export default InvoicesPage;
