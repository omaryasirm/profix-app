import { DetailSkeleton } from "@/components/ui/skeleton-variants";
import React from "react";

const LoadingInvoiceDetailPage = () => {
  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <DetailSkeleton />
    </div>
  );
};

export default LoadingInvoiceDetailPage;
