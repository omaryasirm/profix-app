"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TableSkeleton } from "@/components/ui/skeleton-variants";
import { useInvoices } from "@/hooks/api/useInvoices";
import { useEstimates } from "@/hooks/api/useEstimates";
import { formatDatePakistan } from "@/lib/date-utils";

interface Props {
  type: "invoices" | "estimates";
}

const TablePageContent = ({ type }: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1"));

  const invoicesQuery = useInvoices({
    page,
    limit: 20,
    type: "INVOICE",
  });

  const estimatesQuery = useEstimates({
    page,
    limit: 20,
  });

  const { data, isLoading, error } =
    type === "invoices" ? invoicesQuery : estimatesQuery;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    router.push(`/${type}?page=${newPage}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto md:px-4 md:py-6 max-w-6xl">
        {/* Mobile: No card */}
        <div className="md:hidden px-3 py-4 space-y-4">
          <h1 className="text-2xl font-bold">
            {type === "invoices" ? "Invoices" : "Estimates"}
          </h1>
          <TableSkeleton rows={5} columns={4} />
        </div>
        {/* Desktop: Card */}
        <Card className="hidden md:block">
          <CardHeader>
            <CardTitle className="text-2xl">
              {type === "invoices" ? "Invoices" : "Estimates"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TableSkeleton rows={5} columns={4} />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto md:px-4 md:py-6 max-w-6xl">
        {/* Mobile: No card */}
        <div className="md:hidden px-3 py-4">
          <div className="text-center text-destructive">
            Error loading {type}. Please try again.
          </div>
        </div>
        {/* Desktop: Card */}
        <Card className="hidden md:block">
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              Error loading {type}. Please try again.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const invoices = data?.data || [];
  const totalPages = data?.pagination.totalPages || 1;

  const tableContent = (
    <>
      <div className="overflow-x-auto -mx-3 md:mx-0">
        <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Id</TableHead>
                  <TableHead>Customer Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Issue Date</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      No {type} found
                    </TableCell>
                  </TableRow>
                ) : (
                  invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>{invoice.id}</TableCell>
                      <TableCell>
                        <Link
                          href={`/${type}/${invoice.id}`}
                          className="text-primary hover:underline"
                        >
                          {invoice.name}
                        </Link>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {formatDatePakistan(invoice.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        Rs. {invoice.total}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (page > 1) handlePageChange(page - 1);
                  }}
                  className={page === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => {
                  if (totalPages <= 7) return true;
                  return (
                    p === 1 ||
                    p === totalPages ||
                    (p >= page - 1 && p <= page + 1)
                  );
                })
                .map((p, idx, arr) => {
                  if (idx > 0 && arr[idx - 1] !== p - 1) {
                    return (
                      <React.Fragment key={p}>
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(p);
                            }}
                            isActive={page === p}
                          >
                            {p}
                          </PaginationLink>
                        </PaginationItem>
                      </React.Fragment>
                    );
                  }
                  return (
                    <PaginationItem key={p}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(p);
                        }}
                        isActive={page === p}
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (page < totalPages) handlePageChange(page + 1);
                  }}
                  className={
                    page === totalPages
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </>
  );

  return (
    <div className="container mx-auto md:px-4 md:py-6 max-w-6xl">
      {/* Mobile: No card */}
      <div className="md:hidden px-3 py-4 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold">
            {type === "invoices" ? "Invoices" : "Estimates"}
          </h1>
          <Link href={`/${type}/new`}>
            <Button>
              Create {type === "invoices" ? "Invoice" : "Estimate"}
            </Button>
          </Link>
        </div>
        {tableContent}
      </div>

      {/* Desktop: Card */}
      <Card className="hidden md:block">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-2xl">
              {type === "invoices" ? "Invoices" : "Estimates"}
            </CardTitle>
            <Link href={`/${type}/new`}>
              <Button>
                Create {type === "invoices" ? "Invoice" : "Estimate"}
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {tableContent}
        </CardContent>
      </Card>
    </div>
  );
};

const TablePage = ({ type }: Props) => {
  return (
    <Suspense fallback={
      <div className="container mx-auto md:px-4 md:py-6 max-w-6xl">
        {/* Mobile: No card */}
        <div className="md:hidden px-3 py-4 space-y-4">
          <h1 className="text-2xl font-bold">
            {type === "invoices" ? "Invoices" : "Estimates"}
          </h1>
          <TableSkeleton rows={5} columns={4} />
        </div>
        {/* Desktop: Card */}
        <Card className="hidden md:block">
          <CardHeader>
            <CardTitle className="text-2xl">
              {type === "invoices" ? "Invoices" : "Estimates"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TableSkeleton rows={5} columns={4} />
          </CardContent>
        </Card>
      </div>
    }>
      <TablePageContent type={type} />
    </Suspense>
  );
};

export default TablePage;
