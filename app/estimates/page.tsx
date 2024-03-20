import React from "react";
import TablePage from "../_pages/TablePage";
import prisma from "@/prisma/client";

const EstimatesPage = async () => {
  const estimates = await prisma.invoice.findMany({
    where: { type: { in: ["ESTIMATE"] } },
    orderBy: [{ updatedAt: "desc" }],
  });

  return <TablePage estimates={estimates} />;
};

export default EstimatesPage;
