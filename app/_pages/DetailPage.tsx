"use client";

import { DetailSkeleton } from "@/components/ui/skeleton-variants";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, Trash2 } from "lucide-react";
import RenderPage from "./RenderPage";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useInvoice, useDeleteInvoice } from "@/hooks/api/useInvoices";
import { useEstimate, useApproveEstimate, useDeleteEstimate } from "@/hooks/api/useEstimates";
import { formatDateTimePakistan } from "@/lib/date-utils";

const DetailPage = ({
  params,
  isInvoice,
}: {
  params: { id: string };
  isInvoice?: boolean;
}) => {
  const router = useRouter();
  const invoiceQuery = useInvoice(params.id);
  const estimateQuery = useEstimate(params.id);
  const invoice = isInvoice ? invoiceQuery.data : estimateQuery.data;
  const isLoading = isInvoice ? invoiceQuery.isLoading : estimateQuery.isLoading;

  const approveEstimate = useApproveEstimate();
  const deleteInvoice = useDeleteInvoice();
  const deleteEstimate = useDeleteEstimate();

  const [paymentMethod, setPaymentMethod] = useState<string>("Cash");
  const [paymentAccount, setPaymentAccount] = useState<string>("Waqas");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleApproveEstimate = async () => {
    try {
      await approveEstimate.mutateAsync({
        id: parseInt(params.id),
        data: {
          paymentAccount: paymentAccount,
          paymentMethod: paymentMethod,
        },
      });
      setDialogOpen(false);
      router.push(`/invoices/${params.id}`);
    } catch (error) {
      console.error("Error approving estimate:", error);
    }
  };

  const handleDelete = async () => {
    try {
      if (isInvoice) {
        await deleteInvoice.mutateAsync(parseInt(params.id));
        router.push("/invoices");
      } else {
        await deleteEstimate.mutateAsync(parseInt(params.id));
        router.push("/estimates");
      }
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to delete");
    }
  };

  const getWhatsappMessage = () => {
    let message: string = `PROFIX%20INVOICE%0A%0AInvoice%20No.${invoice?.id}%0AName ${invoice?.name}`;
    return message;
  };

  const TableRowCustom = (props: { name: string; value: any }) => {
    return (
      <TableRow>
        <TableCell className="font-bold w-40">{props.name}</TableCell>
        <TableCell>
          {props.name === "Contact" && invoice?.contact ? (
            <div className="flex items-center gap-2">
              <Link
                href={`https://wa.me/${invoice.contact}`}
                className="text-primary hover:underline"
              >
                {props.value}
              </Link>
              <Link
                href={`https://wa.me/${invoice.contact}?text=${getWhatsappMessage()}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="h-5 w-5 text-green-600" />
              </Link>
            </div>
          ) : (
            props.value
          )}
        </TableCell>
      </TableRow>
    );
  };

  if (isLoading) {
    return (
      <div className="mx-auto md:px-4 max-w-4xl">
        {/* Mobile: No card */}
        <div className="md:hidden px-3">
          <DetailSkeleton />
        </div>
        {/* Desktop: Card */}
        <div className="hidden md:block">
          <DetailSkeleton />
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="container mx-auto md:px-4 md:py-6">
        <div className="text-center text-destructive">
          Invoice/Estimate not found.
        </div>
      </div>
    );
  }

  const actionButtons = (
    <div className="flex flex-wrap gap-2">
      <RenderPage params={params} />
      {!isInvoice && (
        <Button onClick={() => setDialogOpen(true)}>Approve Estimate</Button>
      )}
      <Button
        variant="outline"
        onClick={() =>
          router.push(
            isInvoice
              ? `/invoices/${params.id}/edit`
              : `/estimates/${params.id}/edit`
          )
        }
      >
        {isInvoice ? "Edit Invoice" : "Edit Estimate"}
      </Button>
      <Button
        variant="outline"
        className="text-destructive hover:text-destructive hover:bg-destructive/10"
        onClick={() => setDeleteDialogOpen(true)}
      >
        <Trash2 className="mr-2 h-4 w-4 text-destructive" />
        Delete
      </Button>
    </div>
  );

  const detailsContent = (
    <div className="space-y-6">
      {/* Customer Info */}
      <div>
        <h2 className="text-lg font-semibold mb-3 md:hidden">Customer Info</h2>
        <Table>
          <TableBody>
            <TableRowCustom
              name="Invoice No."
              value={"PROFIX-" + invoice?.id}
            />
            <TableRowCustom
              name="Invoice Date"
              value={formatDateTimePakistan(invoice!.createdAt)}
            />
            <TableRowCustom name="Name" value={invoice!.name} />
            <TableRowCustom name="Contact" value={invoice!.contact} />
            <TableRowCustom name="Vehicle" value={invoice!.vehicle} />
            <TableRowCustom
              name="Registration No"
              value={invoice!.registrationNo}
            />
            <TableRowCustom
              name="Payment Method"
              value={invoice?.paymentMethod ?? ""}
            />
            {invoice?.paymentAccount && (
              <TableRowCustom
                name="Payment Account"
                value={invoice?.paymentAccount}
              />
            )}
          </TableBody>
        </Table>
      </div>

      <Separator className="md:hidden" />

      {/* Items Table */}
      <div>
        <h2 className="text-lg font-semibold mb-3 md:hidden">Items</h2>
        <div className="overflow-x-auto -mx-3 md:mx-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">No</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice!.items?.map((item: { description: string; qty: number; rate: number; amount: number }, index: number) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2 justify-end">
                      <Badge variant="secondary">Qty: {item.qty}</Badge>
                      <Badge variant="secondary">Rate: Rs.{item.rate}</Badge>
                      <Badge>Total: Rs.{item.amount}</Badge>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Separator className="md:hidden" />

      {/* Totals */}
      <div>
        <h2 className="text-lg font-semibold mb-3 md:hidden">Summary</h2>
        <Table>
          <TableBody>
            <TableRowCustom name="Subtotal" value={"Rs." + invoice!.subtotal} />
            <TableRowCustom name="Tax" value={"Rs." + invoice!.tax} />
            <TableRowCustom
              name="Discount"
              value={"Rs." + invoice!.discount}
            />
            <TableRowCustom name="Total" value={"Rs." + invoice!.total} />
          </TableBody>
        </Table>
      </div>
    </div>
  );

  return (
    <div className="mx-auto md:px-4 max-w-4xl">
      {/* Mobile: No cards, minimal padding */}
      <div className="md:hidden px-3">
        {actionButtons}
        <Separator className="mb-6 mt-2" />
        {detailsContent}
      </div>

      {/* Desktop: Cards with proper spacing */}
      <div className="hidden md:block">
        {actionButtons}

        <Card className="mb-4">
          <CardContent className="pt-6">
            <Table>
              <TableBody>
                <TableRowCustom
                  name="Invoice No."
                  value={"PROFIX-" + invoice?.id}
                />
                <TableRowCustom
                  name="Invoice Date"
                  value={formatDateTimePakistan(invoice!.createdAt)}
                />
                <TableRowCustom name="Name" value={invoice!.name} />
                <TableRowCustom name="Contact" value={invoice!.contact} />
                <TableRowCustom name="Vehicle" value={invoice!.vehicle} />
                <TableRowCustom
                  name="Registration No"
                  value={invoice!.registrationNo}
                />
                <TableRowCustom
                  name="Payment Method"
                  value={invoice?.paymentMethod ?? ""}
                />
                {invoice?.paymentAccount && (
                  <TableRowCustom
                    name="Payment Account"
                    value={invoice?.paymentAccount}
                  />
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">No</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice!.items?.map((item: { description: string; qty: number; rate: number; amount: number }, index: number) => (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2 justify-end">
                          <Badge variant="secondary">Qty: {item.qty}</Badge>
                          <Badge variant="secondary">Rate: Rs.{item.rate}</Badge>
                          <Badge>Total: Rs.{item.amount}</Badge>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableBody>
                <TableRowCustom name="Subtotal" value={"Rs." + invoice!.subtotal} />
                <TableRowCustom name="Tax" value={"Rs." + invoice!.tax} />
                <TableRowCustom
                  name="Discount"
                  value={"Rs." + invoice!.discount}
                />
                <TableRowCustom name="Total" value={"Rs." + invoice!.total} />
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} modal={false}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {isInvoice ? "Invoice" : "Estimate"}</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this {isInvoice ? "invoice" : "estimate"}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteInvoice.isPending || deleteEstimate.isPending}
            >
              {(deleteInvoice.isPending || deleteEstimate.isPending) ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen} modal={false}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Estimate</DialogTitle>
            <DialogDescription>
              Select payment method and account
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="mb-2 block">Payment Method</Label>
              <RadioGroup
                value={paymentMethod}
                onValueChange={setPaymentMethod}
              >
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Cash" id="cash" />
                    <Label htmlFor="cash">Cash</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Bank Transfer" id="bank" />
                    <Label htmlFor="bank">Bank Transfer</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {paymentMethod === "Bank Transfer" && (
              <div>
                <Label className="mb-2 block">Payment Account</Label>
                <RadioGroup
                  value={paymentAccount}
                  onValueChange={setPaymentAccount}
                >
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Waqas" id="waqas" />
                      <Label htmlFor="waqas">Waqas</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Shaheryar" id="shaheryar" />
                      <Label htmlFor="shaheryar">Shaheryar</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Profix" id="profix" />
                      <Label htmlFor="profix">Profix Garage</Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleApproveEstimate}
              disabled={approveEstimate.isPending}
            >
              {approveEstimate.isPending ? "Approving..." : "Approve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DetailPage;
