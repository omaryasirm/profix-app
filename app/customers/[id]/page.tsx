"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DetailSkeleton } from "@/components/ui/skeleton-variants";
import { Edit, ArrowLeft } from "lucide-react";
import { useCustomer } from "@/hooks/api/useCustomers";
import { formatDatePakistan } from "@/lib/date-utils";

const CustomerDetailPage = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const { data: customer, isLoading, error } = useCustomer(params.id);

  if (isLoading) {
    return (
      <div className="container mx-auto md:px-4 md:py-6 max-w-4xl">
        {/* Mobile: No card */}
        <div className="md:hidden px-3 py-4">
          <DetailSkeleton />
        </div>
        {/* Desktop: Card */}
        <div className="hidden md:block">
          <DetailSkeleton />
        </div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="container mx-auto md:px-4 md:py-6">
        <div className="text-center text-destructive">
          Customer not found or error loading customer.
        </div>
      </div>
    );
  }

  const actionButtons = (
    <div className="flex flex-wrap gap-2 mb-6">
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      <Link href={`/customers/${customer.id}/edit`}>
        <Button>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </Button>
      </Link>
    </div>
  );

  const customerInfo = (
    <div className="space-y-6">
      {/* Customer Details */}
      <div>
        <h2 className="text-lg font-semibold mb-3 md:hidden">Customer Details</h2>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="font-bold w-40">Contact</TableCell>
              <TableCell>{customer.contact || "-"}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-bold">Vehicle</TableCell>
              <TableCell>{customer.vehicle || "-"}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-bold">Registration No</TableCell>
              <TableCell>{customer.registrationNo || "-"}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {/* Recent Invoices */}
      {customer.invoices && customer.invoices.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3 md:hidden">Recent Invoices</h2>
          <div className="overflow-x-auto -mx-3 md:mx-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice No</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customer.invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>PROFIX-{invoice.id}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            invoice.type === "INVOICE" ? "default" : "secondary"
                          }
                        >
                          {invoice.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDatePakistan(invoice.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        Rs. {invoice.total}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          href={
                            invoice.type === "INVOICE"
                              ? `/invoices/${invoice.id}`
                              : `/estimates/${invoice.id}`
                          }
                        >
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
    </div>
  );

  return (
    <div className="container mx-auto md:px-4 md:py-6 max-w-4xl">
      {/* Mobile: No cards, minimal padding */}
      <div className="md:hidden px-3 py-4">
        <h1 className="text-2xl font-bold mb-4">{customer.name}</h1>
        {actionButtons}
        {customerInfo}
      </div>

      {/* Desktop: Cards with proper spacing */}
      <div className="hidden md:block">
        {actionButtons}

        <Card className="mb-4">
          <CardHeader>
            <CardTitle>{customer.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-bold w-40">Contact</TableCell>
                  <TableCell>{customer.contact || "-"}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-bold">Vehicle</TableCell>
                  <TableCell>{customer.vehicle || "-"}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-bold">Registration No</TableCell>
                  <TableCell>{customer.registrationNo || "-"}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {customer.invoices && customer.invoices.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice No</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customer.invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell>PROFIX-{invoice.id}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              invoice.type === "INVOICE" ? "default" : "secondary"
                            }
                          >
                            {invoice.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDatePakistan(invoice.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          Rs. {invoice.total}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link
                            href={
                              invoice.type === "INVOICE"
                                ? `/invoices/${invoice.id}`
                                : `/estimates/${invoice.id}`
                            }
                          >
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CustomerDetailPage;
