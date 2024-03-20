import DetailPage from "@/app/_pages/DetailPage";

const InvoiceDetailPage = ({ params }: { params: { id: string } }) => {
  return <DetailPage isInvoice={false} params={params} />;
};

export default InvoiceDetailPage;
