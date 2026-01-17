import { TableSkeleton } from "@/components/ui/skeleton-variants";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import React from "react";

const LoadingEstimatesPage = () => {
  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <Card>
        <CardHeader>
          <div className="h-8 w-32 bg-muted animate-pulse rounded" />
        </CardHeader>
        <CardContent>
          <TableSkeleton rows={5} columns={4} />
        </CardContent>
      </Card>
    </div>
  );
};

export default LoadingEstimatesPage;
