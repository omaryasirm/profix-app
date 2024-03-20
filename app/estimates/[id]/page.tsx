import DetailPage from "@/app/_pages/DetailPage";
import React from "react";

const EstimateDetailPage = ({ params }: { params: { id: string } }) => {
  return <DetailPage isInvoice={false} params={params} />;
};

export default EstimateDetailPage;
