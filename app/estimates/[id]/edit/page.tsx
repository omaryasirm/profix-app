import InvoiceForm from "@/app/_pages/_components/invoiceForm";
import React from "react";

const EstimateEditPage = ({ params }: { params?: { id: string } }) => {
  return <InvoiceForm params={params} isInvoice={false} />;
};

export default EstimateEditPage;
