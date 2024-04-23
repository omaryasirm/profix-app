import DetailPage from "@/app/_pages/DetailPage";

const InvoiceDetailPage = ({ params }: { params: { id: string } }) => {
  return <DetailPage isInvoice={true} params={params} />;
};

export default InvoiceDetailPage;
