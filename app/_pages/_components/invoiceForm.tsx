"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FormSkeleton } from "@/components/ui/skeleton-variants";
import { Trash2 } from "lucide-react";
import { SearchCombobox } from "./SearchCombobox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";
import Spinner from "@/app/components/Spinner";
import { useInvoice, type InvoiceItem } from "@/hooks/api/useInvoices";
import { useEstimate } from "@/hooks/api/useEstimates";
import {
  useCreateCustomer,
  useUpdateCustomer,
} from "@/hooks/api/useCustomers";
import {
  useCreateInvoice,
  useUpdateInvoice,
} from "@/hooks/api/useInvoices";
import {
  useCreateEstimate,
  useUpdateEstimate,
} from "@/hooks/api/useEstimates";

const InvoiceForm = ({
  params,
  isInvoice,
}: {
  params?: { id: string };
  isInvoice: boolean;
}) => {
  const router = useRouter();
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [registrationNo, setRegistrationNo] = useState<string | null>("");
  const [contact, setContact] = useState<string | null>("");
  const [vehicle, setVehicle] = useState<string | null>("");
  const [paymentMethod, setPaymentMethod] = useState<string | null>("Cash");
  const [paymentAccount, setPaymentAccount] = useState<string | null>("");
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  interface Item extends InvoiceItem {
    invoiceId?: number;
  }

  interface Customer {
    id?: number;
    name: string;
    contact?: string;
    registrationNo?: string;
    vehicle?: string;
  }

  const [selectedItems, setSelectedItems] = useState<Item[]>([]);

  const invoiceQuery = useInvoice(params?.id);
  const estimateQuery = useEstimate(params?.id);
  const invoice = isInvoice ? invoiceQuery.data : estimateQuery.data;
  const isLoading = params ? (isInvoice ? invoiceQuery.isLoading : estimateQuery.isLoading) : false;

  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const createInvoice = useCreateInvoice();
  const updateInvoice = useUpdateInvoice();
  const createEstimate = useCreateEstimate();
  const updateEstimate = useUpdateEstimate();

  useEffect(() => {
    if (invoice) {
      const items = invoice.items?.map((item: any) => {
        const { id, invoiceId, ...rest } = item;
        return rest;
      }) || [];
      setSelectedItems(items);

      // Set customer for SearchCombobox
      if (invoice.customer) {
        setSelectedCustomer(invoice.customer);
      }

      setName(invoice.name);
      setRegistrationNo(invoice.registrationNo || null);
      setContact(invoice.contact || null);
      setVehicle(invoice.vehicle || null);
      setPaymentMethod(invoice.paymentMethod || "Cash");
      setPaymentAccount(invoice.paymentAccount || null);
      setSubtotal(invoice.subtotal);
      setTax(invoice.tax);
      setDiscount(invoice.discount);
    }
  }, [invoice]);

  const onSubmitInvoice = async () => {
    try {
      setError("");

      let customerData = {
        name: name,
        contact: contact,
        registrationNo: registrationNo,
        vehicle: vehicle,
      };

      let customer;
      if (params) {
        customer = await updateCustomer.mutateAsync({
          id: invoice?.customerId!,
          data: customerData,
        });
      } else {
        customer = await createCustomer.mutateAsync(customerData);
      }

      let invoiceData = {
        customerId: !params ? customer.id : invoice?.customerId!,
        name: name,
        contact: contact,
        registrationNo: registrationNo,
        vehicle: vehicle,
        paymentMethod: paymentMethod,
        paymentAccount: paymentAccount,
        items: selectedItems.map((item) => ({
          description: item.description || "",
          qty: item.qty || 0,
          rate: item.rate || 0,
          amount: item.amount || 0,
        })),
        subtotal: subtotal,
        tax: tax,
        discount: discount,
        total: calcTotal(),
      };

      let res;
      if (params) {
        if (isInvoice) {
          res = await updateInvoice.mutateAsync({
            id: parseInt(params.id),
            data: invoiceData,
          });
        } else {
          res = await updateEstimate.mutateAsync({
            id: parseInt(params.id),
            data: invoiceData,
          });
        }
      } else {
        if (isInvoice) {
          res = await createInvoice.mutateAsync(invoiceData);
        } else {
          res = await createEstimate.mutateAsync(invoiceData);
        }
      }
      router.push(
        isInvoice ? `/invoices/${res.id}` : `/estimates/${res.id}`
      );
    } catch (error: any) {
      setError(error.response?.data?.error || "An unexpected error occurred.");
    }
  };

  const handleItemChange = (item: any) => {
    const newItem: Item = {
      description: item.description,
      qty: 1,
      rate: 0,
      amount: 0,
    };
    setSelectedItems((prevState) => [...prevState, newItem]);
  };

  const handleAddNewItem = async (text: string) => {
    try {
      // Only make the API call - SearchCombobox handles adding to form via onValueChange
      await axios.post("/api/searchItems", { description: text });
    } catch (error) {
      console.error("Failed to create item:", error);
    }
  };

  const handleCustomerChange = (customer: Customer) => {
    setSelectedCustomer(customer);
    setName(customer.name);
    if (customer.contact) setContact(customer.contact);
    if (customer.vehicle) setVehicle(customer.vehicle);
    if (customer.registrationNo) setRegistrationNo(customer.registrationNo);
  };

  const onPaymentMethod = (value: string) => {
    setPaymentMethod(value);
    if (value === "Cash") {
      setPaymentAccount("");
    } else {
      setPaymentAccount("Waqas");
    }
  };

  const calcAmount = (item: Item, index: number) => {
    if (isNaN(item.qty!)) item.qty = 0;
    if (isNaN(item.rate!)) item.rate = 0;
    item.amount = item.qty! * item.rate!;

    const updatedItems = [...selectedItems];
    updatedItems[index] = item;
    setSelectedItems(updatedItems);
    setSubtotal(getItemsAmount(updatedItems));
  };

  const calcTax = () => {
    if (isNaN(tax)) setTax(0);
    return Math.round((subtotal * tax) / 100);
  };

  const calcDiscount = () => {
    if (isNaN(discount)) setDiscount(0);
    return Math.round((subtotal * discount) / 100);
  };

  const calcTotal = () => {
    return Math.round(subtotal + calcTax() - calcDiscount());
  };

  const getItemsAmount = (localSelectedItems?: Item[]) => {
    let temp = 0;
    (localSelectedItems ?? selectedItems).forEach((value) => {
      if (isNaN(value.amount!)) value.amount = 0;
      temp += value.amount!;
    });
    return temp;
  };

  const removeItem = (index: number) => {
    setSelectedItems((oldValues) => {
      const value = oldValues.filter((_, i) => i !== index);
      setSubtotal(getItemsAmount(value));
      return value;
    });
  };

  const isSubmitting =
    createCustomer.isPending ||
    updateCustomer.isPending ||
    createInvoice.isPending ||
    updateInvoice.isPending ||
    createEstimate.isPending ||
    updateEstimate.isPending;

  const formContent = (
    <>
      <div className="space-y-4">
        <div>
          <Label className="mb-2 block">Customer</Label>
          <SearchCombobox
            value={selectedCustomer}
            onValueChange={handleCustomerChange}
            searchEndpoint="/api/customers"
            searchKey="id"
            displayKey="name"
            placeholder="Search customer..."
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              placeholder="Name"
              onChange={(e) => setName(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="contact">Mobile</Label>
            <Input
              id="contact"
              value={contact || ""}
              placeholder="Mobile"
              onChange={(e) => setContact(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="vehicle">Vehicle</Label>
            <Input
              id="vehicle"
              value={vehicle || ""}
              placeholder="Vehicle"
              onChange={(e) => setVehicle(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="registrationNo">Registration No</Label>
            <Input
              id="registrationNo"
              value={registrationNo || ""}
              placeholder="Registration No"
              onChange={(e) => setRegistrationNo(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
      </div>

      {isInvoice && (
        <div className="space-y-4">
          <div>
            <Label>Payment Method</Label>
            <RadioGroup
              value={paymentMethod || "Cash"}
              onValueChange={onPaymentMethod}
              className="mt-2"
            >
              <div className="flex flex-wrap gap-4">
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
              <Label>Payment Account</Label>
              <RadioGroup
                value={paymentAccount || "Waqas"}
                onValueChange={setPaymentAccount}
                className="mt-2"
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
      )}

      <div>
        <Label className="mb-2 block">Add Item</Label>
        <SearchCombobox
          onValueChange={handleItemChange}
          onAddNew={handleAddNewItem}
          searchEndpoint="/api/searchItems"
          searchKey="id"
          displayKey="description"
          placeholder="Search item..."
          className="w-full"
        />
      </div>

      {selectedItems.length > 0 && (
        <div className="overflow-x-auto -mx-3 md:mx-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">No</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-24">Qty</TableHead>
                <TableHead className="w-32">Rate</TableHead>
                <TableHead className="w-32">Amount</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedItems.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>
                    <Input
                      type="text"
                      value={item.qty}
                      placeholder="Qty"
                      className="w-20"
                      onChange={(e) => {
                        const updatedItems = [...selectedItems];
                        updatedItems[index].qty = parseInt(e.target.value) || 0;
                        setSelectedItems(updatedItems);
                        calcAmount(updatedItems[index], index);
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="text"
                      value={item.rate}
                      placeholder="Rate"
                      className="w-28"
                      onChange={(e) => {
                        const updatedItems = [...selectedItems];
                        updatedItems[index].rate = parseInt(e.target.value) || 0;
                        setSelectedItems(updatedItems);
                        calcAmount(updatedItems[index], index);
                      }}
                    />
                  </TableCell>
                  <TableCell>Rs. {item.amount || 0}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="space-y-2 border-t pt-4">
        <div className="flex justify-between">
          <span className="font-semibold">Subtotal:</span>
          <span>Rs. {subtotal}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Tax %:</span>
          <Input
            type="text"
            value={tax}
            placeholder="Tax"
            className="w-20"
            onChange={(e) => setTax(parseInt(e.target.value) || 0)}
          />
          <span className="ml-auto">Rs. {calcTax()}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Discount %:</span>
          <Input
            type="text"
            value={discount}
            placeholder="Discount"
            className="w-20"
            onChange={(e) => setDiscount(parseInt(e.target.value) || 0)}
          />
          <span className="ml-auto">Rs. {calcDiscount()}</span>
        </div>
        <div className="flex justify-between font-bold text-lg border-t pt-2">
          <span>Total:</span>
          <span>Rs. {calcTotal()}</span>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button
        disabled={isSubmitting}
        onClick={onSubmitInvoice}
        className="w-full"
        size="lg"
      >
        {isSubmitting ? (
          <>
            <Spinner />
            <span className="ml-2">Processing...</span>
          </>
        ) : params ? (
          isInvoice ? (
            "Update Invoice"
          ) : (
            "Update Estimate"
          )
        ) : isInvoice ? (
          "Create Invoice"
        ) : (
          "Create Estimate"
        )}
      </Button>
    </>
  );

  return isLoading ? (
    <div className="container mx-auto max-w-4xl px-4 py-6">
      <FormSkeleton fields={6} />
    </div>
  ) : (
    <div className="container mx-auto max-w-4xl md:px-4 md:py-6">
      {/* Mobile: No card, minimal padding */}
      <div className="md:hidden px-3 py-4 space-y-6">
        <h1 className="text-2xl font-bold">
          {params
            ? isInvoice
              ? "Edit Invoice"
              : "Edit Estimate"
            : isInvoice
            ? "Create Invoice"
            : "Create Estimate"}
        </h1>
        {formContent}
      </div>

      {/* Desktop: Card wrapper with padding */}
      <Card className="hidden md:block">
        <CardHeader>
          <CardTitle>
            {params
              ? isInvoice
                ? "Edit Invoice"
                : "Edit Estimate"
              : isInvoice
              ? "Create Invoice"
              : "Create Estimate"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {formContent}
        </CardContent>
      </Card>
    </div>
  );
};

export const dynamic = "force-dynamic";

export default InvoiceForm;
