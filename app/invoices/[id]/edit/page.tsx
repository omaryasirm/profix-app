import InvoiceForm from "@/app/_pages/_components/invoiceForm";
import React from "react";

const InvoiceEditPage = ({ params }: { params?: { id: string } }) => {
  return <InvoiceForm params={params} isInvoice={true} />;
};
export default InvoiceEditPage;
