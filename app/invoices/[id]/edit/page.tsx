import React from "react";
import InvoiceForm from "../../_components/invoiceForm";

const InvoiceEditPage = ({ params }: { params?: { id: string } }) => {
  return <InvoiceForm params={params} />;
};
export default InvoiceEditPage;
