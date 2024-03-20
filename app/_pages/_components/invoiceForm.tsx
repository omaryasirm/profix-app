"use client";

import React, { useEffect, useRef } from "react";
import {
  Button,
  Callout,
  TextField,
  Table,
  Flex,
  Select,
  Heading,
  RadioGroup,
  Text,
} from "@radix-ui/themes";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Spinner from "@/app/components/Spinner";
import axios from "axios";
import { Prisma } from "@prisma/client";
import { TiDelete } from "react-icons/ti";
import MyCombobox from "./MyCombobox";
import { Transition } from "@headlessui/react";

const InvoiceForm = ({
  params,
  isInvoice,
}: {
  params?: { id: string };
  isInvoice: boolean;
}) => {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState("");
  const [registrationNo, setRegistrationNo] = useState<string | null>("");
  const [contact, setContact] = useState<string | null>("");
  const [vehicle, setVehicle] = useState<string | null>("");
  const [paymentMethod, setPaymentMethod] = useState<string | null>("");
  const [paymentAccount, setPaymentAccount] = useState<string | null>("");
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [discount, setDiscount] = useState(0);

  interface Item {
    id?: number;
    description?: string;
    qty?: number | undefined;
    rate?: number | undefined;
    amount?: number | undefined;
    invoiceId?: number;
  }

  interface Customer {
    id?: number;
    name: string;
    contact?: string;
    registrationNo?: string;
    vehicle?: string;
  }

  const [searchItems, setSearchItems] = useState<Item[]>([]);
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);

  const [searchCustomer, setSearchCustomer] = useState<Customer[]>([]);

  const invoiceWithItems = Prisma.validator<Prisma.InvoiceDefaultArgs>()({
    include: { items: true },
  });
  type invoiceWithItems = Prisma.InvoiceGetPayload<typeof invoiceWithItems>;

  const [invoice, setInvoice] = useState<invoiceWithItems>();
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      getInvoice();
    }
  });

  const getInvoice = async () => {
    if (params != null) {
      let res: { data: invoiceWithItems } = await axios.get(
        `/api/invoices/${params.id}`
      );
      setInvoice(res.data);
      console.log(res.data);

      res.data.items.forEach(
        (item: {
          id?: number;
          description: string;
          qty: number;
          rate: number;
          amount: number;
          invoiceId?: number;
        }) => {
          delete item.id;
          delete item.invoiceId;
          setSelectedItems((prevState) => [
            ...prevState,
            Object.assign({}, item),
          ]);
        }
      );

      setName(res.data.name);
      setRegistrationNo(res.data.registrationNo);
      setContact(res.data.contact);
      setVehicle(res.data.vehicle);
      setPaymentMethod(res.data.paymentMethod);
      setPaymentAccount(res.data.paymentAccount);
      setSubtotal(res.data.subtotal);
      setTax(res.data.tax);
      setDiscount(res.data.discount);
    }
    getSearchItems();
  };

  const getSearchItems = async () => {
    let res = await axios.get("/api/searchItems");
    setSearchItems(res.data);

    await getCustomers();
    // console.log(res.data);
    setIsLoading(false);
  };

  const getCustomers = async () => {
    let res = await axios.get("/api/customers");
    console.log(res.data);

    setSearchCustomer(res.data);

    setIsLoading(false);
  };

  const onSubmitInvoice = async (_: any) => {
    try {
      setIsSubmitting(true);

      let customerData = {
        name: name,
        contact: contact,
        registrationNo: registrationNo,
        vehicle: vehicle,
      };

      let customer: { data: Customer } = params
        ? await axios.patch(
            `/api/customers/${invoice?.customerId!}`,
            customerData
          )
        : await axios.post("/api/customers", customerData);

      let invoiceData = {
        customerId: !params ? customer!.data.id : invoice?.customerId!,
        name: name,
        contact: contact,
        registrationNo: registrationNo,
        vehicle: vehicle,
        paymentMethod: paymentMethod,
        paymentAccount: paymentAccount,
        items: selectedItems,
        subtotal: subtotal,
        tax: tax,
        discount: discount,
        total: calcTotal(),
      };

      console.log(invoiceData);

      var res = params
        ? await axios.patch(
            isInvoice
              ? `/api/invoices/${params.id}`
              : `/api/estimates/${params.id}`,
            invoiceData
          )
        : await axios.post(
            isInvoice ? "/api/invoices" : "/api/estimates",
            invoiceData
          );
      console.log(res);
      router.push(
        isInvoice ? `/invoices/${res.data.id}` : `/estimates/${res.data.id}`
      );
    } catch (error) {
      setIsSubmitting(false);
      setError("An unexpected erorr occurred.");
    }
  };

  const handleChange = (event: any) => {
    delete event.id;
    event.qty = 1;
    setSelectedItems((prevState) => [...prevState, Object.assign({}, event)]);
  };

  const handleCustomerChange = (customer: Customer) => {
    setName(customer.name);
    customer.contact && setContact(customer.contact);
    customer.vehicle && setVehicle(customer.vehicle);
    customer.registrationNo && setRegistrationNo(customer.registrationNo);

    // set invoice for edit
    let invoiceTemp = Object.assign({}, invoice);
    invoiceTemp.name = customer.name;
    invoiceTemp.contact = customer.contact ?? null;
    invoiceTemp.vehicle = customer.vehicle ?? null;
    invoiceTemp.registrationNo = customer.registrationNo ?? null;
    setInvoice(invoiceTemp);
    console.log(invoiceTemp);
  };

  const addNew = (text: string) => {
    let value: Item = { description: text };
    setSearchItems((prevState) => [...prevState, Object.assign({}, value)]);
    axios.post("/api/searchItems", value);

    value.qty = 1;
    setSelectedItems((prevState) => [...prevState, Object.assign({}, value)]);

    // console.log(event);
  };

  const onPaymentMethod = (value: string) => {
    setPaymentMethod(value);

    if (value == "Cash") {
      setPaymentAccount("");
    }
  };

  const calcAmount = (item: Item) => {
    if (isNaN(item.qty!)) item.qty = 0;
    if (isNaN(item.rate!)) item.rate = 0;
    item.amount = item.qty! * item.rate!;

    setSubtotal(getItemsAmount());
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

  return isLoading ? (
    <Spinner fullPage={true} />
  ) : (
    <div className="max-w-xl space-y-3" id="customer-combo">
      <Heading>
        {params
          ? isInvoice
            ? "Edit Invoice"
            : "Edit Estimate"
          : isInvoice
          ? "Create Invoice"
          : "Create Estimate"}
      </Heading>
      <MyCombobox
        style={{ marginTop: "20px" }}
        handleChange={handleCustomerChange}
        searchItems={searchCustomer}
        searchItemValue={"name"}
        placeholder="Search customer"
      />
      {/* name */}
      <TextField.Root>
        <TextField.Input
          value={name}
          placeholder="Name"
          onChange={(e) => setName(e.target.value)}
        />
      </TextField.Root>
      {/* contact */}
      <TextField.Root>
        <TextField.Input
          value={contact ?? undefined}
          placeholder="Mobile"
          onChange={(e) => setContact(e.target.value)}
        />
      </TextField.Root>
      {/* Vehicle */}
      <TextField.Root>
        <TextField.Input
          value={vehicle ?? undefined}
          placeholder="Vehicle"
          onChange={(e) => setVehicle(e.target.value)}
        />
      </TextField.Root>
      {/* Registration */}
      <TextField.Root>
        <TextField.Input
          value={registrationNo ?? undefined}
          placeholder="Registration No"
          onChange={(e) => setRegistrationNo(e.target.value)}
        />
      </TextField.Root>
      {isInvoice && (
        <div
          id="item-combo"
          className="space-y-3"
          style={{ margin: "15px 2px" }}
        >
          <RadioGroup.Root
            defaultValue={params ? invoice?.paymentMethod ?? "Cash" : "Cash"}
            onValueChange={onPaymentMethod}
          >
            <Flex gap="2" direction="row">
              <Text as="label" size="2">
                <Flex gap="2">
                  <RadioGroup.Item value="Cash" /> Cash
                </Flex>
              </Text>
              <Text as="label" size="2">
                <Flex gap="2">
                  <RadioGroup.Item value="Bank Transfer" /> Bank Transfer
                </Flex>
              </Text>
            </Flex>
          </RadioGroup.Root>

          <Transition
            show={paymentMethod == "Bank Transfer"}
            enter="transition-opacity duration-500"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity duration-0"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <RadioGroup.Root
              defaultValue={
                params ? invoice?.paymentAccount ?? "Waqas" : "Waqas"
              }
              onValueChange={setPaymentAccount}
            >
              <Flex gap="2" direction="row">
                <Text as="label" size="2">
                  <Flex gap="2">
                    <RadioGroup.Item value="Waqas" /> Waqas
                  </Flex>
                </Text>
                <Text as="label" size="2">
                  <Flex gap="2">
                    <RadioGroup.Item value="Shaheryar" /> Shaheryar
                  </Flex>
                </Text>
              </Flex>
            </RadioGroup.Root>
          </Transition>
        </div>
      )}
      <MyCombobox
        id="item-combo"
        handleChange={handleChange}
        addNew={addNew}
        searchItems={searchItems}
        searchItemValue={"description"}
        placeholder="Search item..."
      />
      {selectedItems.length > 0 ? (
        <Table.Root variant="surface">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell width={20}>No</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
              {/* <Table.ColumnHeaderCell width={70}>Qty</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell width={100}>Rate</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell width={80}>Amount</Table.ColumnHeaderCell> */}
            </Table.Row>
          </Table.Header>
          <Table.Body style={{ verticalAlign: "middle" }}>
            {selectedItems.map((item, index) => (
              <Table.Row key={index}>
                <Table.Cell>
                  {/* <Link href={`/issues/${issue.id}`} childern={issue.title} /> */}
                  {index + 1}
                </Table.Cell>
                <Table.Cell>
                  <div>{item.description}</div>
                  <Flex className="mt-1" align={"center"}>
                    <div className="mr-1">
                      <TextField.Input
                        style={{ width: "50px" }}
                        defaultValue={1}
                        placeholder="Qty"
                        onChange={(e) => (
                          (item.qty = parseInt(e.target.value)),
                          calcAmount(item)
                        )}
                      />
                    </div>
                    <div className="mr-2">
                      <TextField.Input
                        defaultValue={params ? item.rate : undefined}
                        style={{ width: "100px" }}
                        placeholder="Rate"
                        onChange={(e) => (
                          (item.rate = parseInt(e.target.value)),
                          calcAmount(item)
                        )}
                      />
                    </div>
                    Rs.{item.amount == null ? "0" : item.amount}
                    <div style={{ textAlign: "right", width: "100%" }}>
                      <button onClick={() => removeItem(index)}>
                        <TiDelete size={"1.5rem"} />
                      </button>
                    </div>
                  </Flex>
                </Table.Cell>
                {/* <Table.Cell>
                <TextField.Root>
                  <TextField.Input
                    // defaultValue={"title"}
                    placeholder="Qty"
                    onChange={(e) => (
                      (item.qty = parseInt(e.target.value)), calcAmount(item)
                    )}
                  />
                </TextField.Root>
              </Table.Cell>
              <Table.Cell>
                <TextField.Root>
                  <TextField.Input
                    // defaultValue={"title"}
                    placeholder="Rate"
                    onChange={(e) => (
                      (item.rate = parseInt(e.target.value)), calcAmount(item)
                    )}
                  />
                </TextField.Root>
              </Table.Cell>
              <Table.Cell>Rs.{item.amount}</Table.Cell> */}
                {/* <Table.Cell className="hidden md:table-cell">
                  {issue.createdAt.toDateString()}
                </Table.Cell> */}
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      ) : (
        <div></div>
      )}
      <p className="font-bold">Subtotal: Rs.{subtotal}</p>
      <Flex align="center">
        <span>%</span>
        <TextField.Root className="mx-2 w-20">
          <TextField.Input
            defaultValue={params ? tax : undefined}
            placeholder="Tax"
            onChange={(e) => setTax(parseInt(e.target.value))}
          />
        </TextField.Root>
        <p>Rs.{calcTax()}</p>
      </Flex>
      <Flex align="center">
        <span>%</span>
        <TextField.Root className="mx-2 w-20">
          <TextField.Input
            defaultValue={params ? discount : undefined}
            placeholder="Discount"
            onChange={(e) => setDiscount(parseInt(e.target.value))}
          />
        </TextField.Root>
        <p>Rs.{calcDiscount()}</p>
      </Flex>
      <p className="font-bold">Total: Rs.{calcTotal()}</p>
      {error && (
        <Callout.Root color="red" className="mb-5">
          <Callout.Text>{error}</Callout.Text>
        </Callout.Root>
      )}
      <Button
        disabled={isSubmitting}
        onClick={onSubmitInvoice}
        style={{ marginBottom: "500px" }}
      >
        {params
          ? isInvoice
            ? "Update Invoice"
            : "Update Estimate"
          : isInvoice
          ? "Create Invoice"
          : "Create Estimate"}
        {isSubmitting && <Spinner />}
      </Button>
    </div>
  );
};

export const dynamic = "force-dynamic";

export default InvoiceForm;
