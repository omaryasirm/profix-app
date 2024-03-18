import InvoiceForm from "@/app/invoices/_components/invoiceForm";
import React from "react";

const InvoiceEditPage = ({ params }: { params?: { id: string } }) => {
  return <InvoiceForm params={params} />;
};
export default InvoiceEditPage;
