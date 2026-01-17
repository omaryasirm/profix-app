import React from "react";
import prisma from "@/prisma/client";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDatePakistan } from "@/lib/date-utils";

const DashboardPage = async () => {
  const [invoicesCount, estimatesCount, customersCount, recentInvoices] =
    await Promise.all([
      prisma.invoice.count({ where: { type: "INVOICE" } }),
      prisma.invoice.count({ where: { type: "ESTIMATE" } }),
      prisma.customer.count(),
      prisma.invoice.findMany({
        where: { type: "INVOICE" },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          customer: true,
        },
      }),
    ]);

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoicesCount}</div>
            <Link href="/invoices">
              <Button variant="link" className="p-0 h-auto">
                View all invoices
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Estimates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estimatesCount}</div>
            <Link href="/estimates">
              <Button variant="link" className="p-0 h-auto">
                View all estimates
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customersCount}</div>
            <Link href="/customers">
              <Button variant="link" className="p-0 h-auto">
                View all customers
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {recentInvoices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No invoices yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice No</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="hidden sm:table-cell">Date</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        PROFIX-{invoice.id}
                      </TableCell>
                      <TableCell>{invoice.name}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {formatDatePakistan(invoice.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">Rs. {invoice.total}</TableCell>
                      <TableCell className="text-right">
                        <Link href={`/invoices/${invoice.id}`}>
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export const dynamic = "force-dynamic";

export default DashboardPage;
