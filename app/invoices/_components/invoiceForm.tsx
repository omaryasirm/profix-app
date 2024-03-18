"use client";

import React, { useEffect, useRef } from "react";
import {
  Button,
  Callout,
  TextField,
  Table,
  Flex,
  Select,
} from "@radix-ui/themes";
import { createInvoiceSchema } from "@/app/validationSchemas";
import { useRouter } from "next/navigation";
import { Fragment, useState } from "react";
import Spinner from "@/app/components/Spinner";
import { z } from "zod";
import { Combobox, Transition } from "@headlessui/react";
import axios from "axios";
import { Item, Prisma } from "@prisma/client";

type InvoiceFormData = z.infer<typeof createInvoiceSchema>;

const InvoiceForm = ({ params }: { params?: { id: string } }) => {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [contact, setContact] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentAccount, setPaymentAccount] = useState<string | null>("");
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [discount, setDiscount] = useState(0);

  interface searchItem {
    description: string;
  }

  const [searchItems, setSearchItems] = useState<searchItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);
  const [query, setQuery] = useState("");

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
  }, []);

  const getInvoice = async () => {
    if (params != null) {
      let res: { data: invoiceWithItems } = await axios.get(
        `/api/invoices/${params.id}`
      );
      setInvoice(res.data);
      console.log(res.data);

      res.data.items.forEach((item: Item) => {
        delete item.id;
        delete item.invoiceId;
        setSelectedItems((prevState) => [
          ...prevState,
          Object.assign({}, item),
        ]);
      });

      setName(res.data.name);
      setAddress(res.data.address);
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
    console.log(res.data);
    setIsLoading(false);
  };

  const onSubmitInvoice = async (_) => {
    let data = {
      name: name,
      address: address,
      contact: contact,
      vehicle: vehicle,
      paymentMethod: paymentMethod,
      paymentAccount: paymentAccount,
      items: selectedItems,
      subtotal: subtotal,
      tax: tax,
      discount: discount,
      total: calcTotal(),
    };

    console.log(data);

    try {
      setIsSubmitting(true);
      var res = params
        ? await axios.patch(`/api/invoices/${params.id}`, data)
        : await axios.post("/api/invoices", data);
      console.log(res);
      router.push(`/invoices/${res.data.id}`);
    } catch (error) {
      setIsSubmitting(false);
      setError("An unexpected erorr occurred.");
    }
  };

  const handleChange = (event: Item) => {
    delete event.id;
    event.qty = 1;
    setSelectedItems((prevState) => [...prevState, Object.assign({}, event)]);
  };

  const addNew = (text: String) => {
    let value = { description: text };
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
    if (isNaN(item.qty)) item.qty = 0;
    if (isNaN(item.rate)) item.rate = 0;
    item.amount = item.qty * item.rate;

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

  const getItemsAmount = () => {
    let temp = 0;
    selectedItems.forEach((value) => {
      if (isNaN(value.amount)) value.amount = 0;
      temp += value.amount;
    });

    return temp;
  };

  const removeItem = (index: number) => {
    setSelectedItems((oldValues) => {
      return oldValues.filter((_, i) => i !== index);
    });
  };

  const filteredPeople =
    query === ""
      ? searchItems
      : searchItems.filter((item) =>
          item.description
            .toLowerCase()
            .replace(/\s+/g, "")
            .includes(query.toLowerCase().replace(/\s+/g, ""))
        );

  return isLoading ? (
    <Spinner />
  ) : (
    <div className="max-w-xl space-y-3 mt-3">
      <p className="font-medium text-lg">
        {params ? "Edit Invoice" : "Create Invoice"}
      </p>
      {/* <form className="space-y-3" onSubmit={onSubmit}> */}
      <TextField.Root>
        <TextField.Input
          defaultValue={params ? invoice?.name : undefined}
          placeholder="Name"
          onChange={(e) => setName(e.target.value)}
        />
      </TextField.Root>
      <TextField.Root>
        <TextField.Input
          defaultValue={params ? invoice?.address : undefined}
          placeholder="Address"
          onChange={(e) => setAddress(e.target.value)}
        />
      </TextField.Root>
      <TextField.Root>
        <TextField.Input
          defaultValue={params ? invoice?.contact : undefined}
          placeholder="Mobile"
          onChange={(e) => setContact(e.target.value)}
        />
      </TextField.Root>
      <TextField.Root>
        <TextField.Input
          defaultValue={params ? invoice?.vehicle : undefined}
          placeholder="Vehicle"
          onChange={(e) => setVehicle(e.target.value)}
        />
      </TextField.Root>
      <Select.Root
        onValueChange={onPaymentMethod}
        defaultValue={params ? invoice?.paymentMethod : ""}
      >
        <Select.Trigger placeholder="Payment Method" className="w-full" />
        <Select.Content position="popper">
          <Select.Item value="Cash">Cash</Select.Item>
          <Select.Item value="Bank Transfer">Bank Transfer</Select.Item>
        </Select.Content>
      </Select.Root>
      {paymentMethod == "Bank Transfer" && (
        <Select.Root
          onValueChange={setPaymentAccount}
          defaultValue={params ? invoice?.paymentAccount ?? undefined : ""}
        >
          <Select.Trigger placeholder="Payment Account" className="w-full" />
          <Select.Content position="popper">
            <Select.Item value="Waqas">Waqas</Select.Item>
            <Select.Item value="Shaheryar">Shaheryar</Select.Item>
          </Select.Content>
        </Select.Root>
      )}
      {/* <ErrorMessage>{errors.title?.message}</ErrorMessage> */}
      <Combobox
        // defaultValue={"Tag"}
        // value={selected}
        onChange={handleChange}
      >
        <div className="max-w-xl mt-1">
          <div className="max-w-xl w-full cursor-default overflow-hidden rounded-lg bg-white text-left border sm:text-sm">
            <Combobox.Input
              placeholder="Search item..."
              className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900"
              // displayValue={(item) => item.name}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            afterLeave={() => setQuery("")}
          >
            <Combobox.Options
              className="z-10 absolute max-w-xl mt-1 max-h-60 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm"
              style={{ width: "calc(100% - 40px)" }}
            >
              <Combobox.Button
                onClick={(value) => addNew(query)}
                className="relative cursor-default ml-3 my-button"
              >
                Add
                {/* <Button
                  onClick={(value) => addNew(query)}
                  className="font-medium"
                >
                  Add
                </Button> */}
              </Combobox.Button>
              {filteredPeople.length === 0 && query !== "" ? (
                <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
                  Nothing found.
                </div>
              ) : (
                filteredPeople.map((item, index) => (
                  <Combobox.Option
                    key={index}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-5 pr-4 ${
                        active ? "bg-teal-600 text-white" : "text-gray-900"
                      }`
                    }
                    value={item}
                  >
                    {({ selected, active }) => (
                      <>
                        <span
                          className={`block truncate ${
                            selected ? "font-medium" : "font-normal"
                          }`}
                        >
                          {item.description}
                        </span>
                        {selected ? (
                          <span
                            className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                              active ? "text-white" : "text-teal-600"
                            }`}
                          >
                            {/* <CheckIcon
                                className="h-5 w-5"
                                aria-hidden="true"
                              /> */}
                          </span>
                        ) : null}
                      </>
                    )}
                  </Combobox.Option>
                ))
              )}
            </Combobox.Options>
          </Transition>
        </div>
      </Combobox>
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
                        <span className="material-symbols-outlined">
                          delete
                        </span>
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
        {params ? "Update Invoice" : "Create Invoice"}
        {isSubmitting && <Spinner />}
      </Button>
      {/* </form> */}
    </div>
  );
};

export const dynamic = "force-dynamic";

export default InvoiceForm;
