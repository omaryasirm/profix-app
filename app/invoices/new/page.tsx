"use client";

import React, { useEffect } from "react";
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

type InvoiceFormData = z.infer<typeof createInvoiceSchema>;

const NewInvoicePage = () => {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [contact, setContact] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentAccount, setPaymentAccount] = useState("");
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [discount, setDiscount] = useState(0);

  const [searchItems, setSearchItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (searchItems.length == 0) {
      getSearchItems();
    }
  }, []);

  const getSearchItems = async () => {
    let res = await axios.get("/api/searchItems");
    setSearchItems(res.data);
    console.log(res.data);
    setIsLoading(false);
  };

  const onCreateInvoice = async (_) => {
    let data = {
      name: name.target?.value,
      address: address.target?.value,
      contact: contact.target?.value,
      vehicle: vehicle.target?.value,
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
      var res = await axios.post("/api/invoices", data);
      console.log(res);
      router.push(`/invoices/render/${res.data.id}`);
      // Router.push({
      //   pathname: "/invoices/render",
      //   query: { user_id: this.props.data.member.user.id },
      // });
      // let string = JSON.stringify({ value: array });
      // const params = new URLSearchParams(searchParams);
      // params.set("query", string);
      // router.refresh();
      setIsSubmitting(false);
    } catch (error) {
      setIsSubmitting(false);
      setError("An unexpected erorr occurred.");
    }
  };

  const handleChange = (event) => {
    delete event.id;
    setSelectedItems((prevState) => [...prevState, Object.assign({}, event)]);
  };

  const addNew = (text) => {
    let value = { description: text };
    setSearchItems((prevState) => [...prevState, Object.assign({}, value)]);
    setSelectedItems((prevState) => [...prevState, Object.assign({}, value)]);

    axios.post("/api/searchItems", value);

    // console.log(event);
  };

  const calcAmount = (item) => {
    item.amount = item.qty * item.rate;

    setSubtotal(getItemsAmount());
  };

  const calcTax = () => {
    return (subtotal * tax) / 100;
  };

  const calcDiscount = () => {
    return (subtotal * discount) / 100;
  };

  const calcTotal = () => {
    return subtotal + calcTax() - calcDiscount();
  };

  const getItemsAmount = () => {
    let temp = 0;
    selectedItems.forEach((value) => {
      temp += value.amount;
    });

    return temp;
  };

  const filteredPeople =
    query === ""
      ? searchItems
      : searchItems.filter((person) =>
          person.description
            .toLowerCase()
            .replace(/\s+/g, "")
            .includes(query.toLowerCase().replace(/\s+/g, ""))
        );

  return isLoading ? (
    <Spinner />
  ) : (
    <div className="max-w-xl space-y-3 mt-3">
      <p className="font-medium text-lg">Create Invoice</p>
      {error && (
        <Callout.Root color="red" className="mb-5">
          <Callout.Text>{error}</Callout.Text>
        </Callout.Root>
      )}
      {/* <form className="space-y-3" onSubmit={onSubmit}> */}
      <TextField.Root>
        <TextField.Input
          // defaultValue={"title"}
          placeholder="Name"
          onChange={setName}
        />
      </TextField.Root>
      <TextField.Root>
        <TextField.Input
          // defaultValue={"title"}
          placeholder="Address"
          onChange={setAddress}
        />
      </TextField.Root>
      <TextField.Root>
        <TextField.Input
          // defaultValue={"title"}
          placeholder="Mobile"
          onChange={setContact}
        />
      </TextField.Root>
      <TextField.Root>
        <TextField.Input
          // defaultValue={"title"}
          placeholder="Vehicle"
          onChange={setVehicle}
        />
      </TextField.Root>
      <Select.Root onValueChange={setPaymentMethod}>
        <Select.Trigger placeholder="Payment Method" className="w-full" />
        <Select.Content position="popper">
          <Select.Item value="Cash">Cash</Select.Item>
          <Select.Item value="Bank Transfer">Bank Transfer</Select.Item>
        </Select.Content>
      </Select.Root>
      <Select.Root onValueChange={setPaymentAccount}>
        <Select.Trigger placeholder="Payment Account" className="w-full" />
        <Select.Content position="popper">
          <Select.Item value="Waqas Ahmed">Waqas Ahmed</Select.Item>
          <Select.Item value="Chari Bhai">Chari Bhai</Select.Item>
        </Select.Content>
      </Select.Root>
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
              // displayValue={(person) => person.name}
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
                className="relative cursor-default ml-3 mb-10 my-button"
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
                filteredPeople.map((person, index) => (
                  <Combobox.Option
                    key={index}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-5 pr-4 ${
                        active ? "bg-teal-600 text-white" : "text-gray-900"
                      }`
                    }
                    value={person}
                  >
                    {({ selected, active }) => (
                      <>
                        <span
                          className={`block truncate ${
                            selected ? "font-medium" : "font-normal"
                          }`}
                        >
                          {person.description}
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

      <Table.Root variant="surface">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell width={20}>Id</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell width={70}>Qty</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell width={100}>Rate</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell width={80}>Amount</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body style={{ verticalAlign: "middle" }}>
          {selectedItems.map((item, index) => (
            <Table.Row key={index}>
              <Table.Cell>
                {/* <Link href={`/issues/${issue.id}`} childern={issue.title} /> */}
                {index + 1}
              </Table.Cell>
              <Table.Cell>{item.description}</Table.Cell>
              <Table.Cell>
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
              <Table.Cell>Rs.{item.amount}</Table.Cell>
              {/* <Table.Cell className="hidden md:table-cell">
                  {issue.createdAt.toDateString()}
                </Table.Cell> */}
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
      <p className="font-bold">Subtotal: Rs.{subtotal}</p>
      <Flex align="center">
        <span>%</span>
        <TextField.Root className="mx-2 w-20">
          <TextField.Input
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
            placeholder="Discount"
            onChange={(e) => setDiscount(parseInt(e.target.value))}
          />
        </TextField.Root>
        <p>Rs.{calcDiscount()}</p>
      </Flex>

      <p className="font-bold">Total: Rs.{calcTotal()}</p>
      <Button
        disabled={isSubmitting}
        onClick={onCreateInvoice}
        style={{ marginBottom: "500px" }}
      >
        {"Create Invoice"}
        {isSubmitting && <Spinner />}
      </Button>
      {/* </form> */}
    </div>
  );
};

export const dynamic = "force-dynamic";

export default NewInvoicePage;
