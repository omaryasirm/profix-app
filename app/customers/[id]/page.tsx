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
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <DetailSkeleton />
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center text-destructive">
          Customer not found or error loading customer.
        </div>
      </div>
    );
  }


  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="mb-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <Card className="mb-4">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{customer.name}</CardTitle>
            <Link href={`/customers/${customer.id}/edit`}>
              <Button>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </Link>
          </div>
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
  );
};

export default CustomerDetailPage;
