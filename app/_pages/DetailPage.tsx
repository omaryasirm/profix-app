"use client";

import { Spinner } from "@/app/components";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import {
  Badge,
  Button,
  Dialog,
  Flex,
  IconButton,
  Link,
  RadioGroup,
  Table,
  Text,
  TextField,
} from "@radix-ui/themes";
import { Prisma } from "@prisma/client";
import { useRouter } from "next/navigation";
import { FaWhatsappSquare } from "react-icons/fa";
import RenderPage from "./RenderPage";
import { Transition } from "@headlessui/react";

const DetailPage = ({
  params,
  isInvoice,
}: {
  params: { id: string };
  isInvoice?: boolean;
}) => {
  const invoiceWithItems = Prisma.validator<Prisma.InvoiceDefaultArgs>()({
    include: { items: true },
  });
  type invoiceWithItems = Prisma.InvoiceGetPayload<typeof invoiceWithItems>;

  const [invoice, setInvoice] = useState<invoiceWithItems>();
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const [paymentMethod, setPaymentMethod] = useState<string | null>("");
  const [paymentAccount, setPaymentAccount] = useState<string | null>("");

  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      getInvoice();
    }
  }, []);

  const getInvoice = async () => {
    let res = await axios.get(`/api/invoices/${params.id}`);
    setInvoice(res.data);
    console.log(res.data);
    setIsLoading(false);
  };

  const approveEstimate = async (_: any) => {
    let data = {
      paymentAccount: paymentAccount,
      paymentMethod: paymentMethod,
    };

    let res = await axios.patch(`/api/estimates/${params.id}/approve`, data);

    router.push(`/invoices/${params.id}`);
  };

  const getWhatsappMessage = () => {
    let message: string = `PROFIX%20INVOICE%0A%0AInvoice%20No.${invoice?.id}%0AName ${invoice?.name}`;

    return message;
  };

  const TableRowCustom = (props: { name: string; value: any }) => {
    return (
      <Table.Row>
        <Table.Cell className="font-bold w-40">{props.name}</Table.Cell>
        <Table.Cell className="flex">
          {props.name == "Contact" ? (
            <>
              <Link href={`https://wa.me/${invoice?.contact}`}>
                {" "}
                {props.value}
              </Link>
              <button className="ml-2 flex items-center">
                <Link
                  href={`https://wa.me/${
                    invoice?.contact
                  }?text=${getWhatsappMessage()}`}
                >
                  <FaWhatsappSquare size={"1.8rem"} color="green" />
                </Link>
              </button>
            </>
          ) : (
            props.value
          )}
        </Table.Cell>
      </Table.Row>
    );
  };

  return isLoading ? (
    <Spinner fullPage={true} />
  ) : (
    <div className="max-w-xl pb-10">
      <Flex className="mb-3" justify={"between"} align={"end"}>
        <RenderPage params={params} />
        <Flex direction={"column"} gap="2">
          {!isInvoice && (
            <Dialog.Root>
              <Dialog.Trigger>
                <Button>Approve Estimate</Button>
              </Dialog.Trigger>

              <Dialog.Content style={{ maxWidth: 450 }}>
                <Dialog.Title>Approve Estimate</Dialog.Title>
                <Dialog.Description size="2" mb="4">
                  Select payment method
                </Dialog.Description>

                <Flex direction="column" gap="3">
                  <label>
                    <Text as="div" size="2" mb="1" weight="bold">
                      Payment Method
                    </Text>
                    <div
                      id="item-combo"
                      className="space-y-3"
                      style={{ margin: "15px 2px" }}
                    >
                      <RadioGroup.Root
                        defaultValue={"Cash"}
                        onValueChange={setPaymentMethod}
                      >
                        <Flex gap="2" direction="row">
                          <Text as="label" size="2">
                            <Flex gap="2">
                              <RadioGroup.Item value="Cash" /> Cash
                            </Flex>
                          </Text>
                          <Text as="label" size="2">
                            <Flex gap="2">
                              <RadioGroup.Item value="Bank Transfer" /> Bank
                              Transfer
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
                          defaultValue={"Waqas"}
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
                  </label>
                </Flex>

                <Flex gap="3" mt="4" justify="end">
                  <Dialog.Close>
                    <Button variant="soft" color="gray">
                      Cancel
                    </Button>
                  </Dialog.Close>
                  <Dialog.Close>
                    <Button onClick={approveEstimate}>Approve</Button>
                  </Dialog.Close>
                </Flex>
              </Dialog.Content>
            </Dialog.Root>
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
        </Flex>
      </Flex>

      <Table.Root variant="surface">
        <Table.Body>
          <TableRowCustom
            name="Invoice No."
            value={"PROFIX-" + invoice?.id ?? ""}
          />
          <TableRowCustom
            name="Invoice Date"
            value={
              new Date(invoice!.createdAt).getDate() +
                " " +
                new Date(invoice!.createdAt).toLocaleDateString("en-us", {
                  month: "long",
                  year: "numeric",
                }) ?? ""
            }
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
              value={invoice?.paymentAccount ?? ""}
            />
          )}
        </Table.Body>
      </Table.Root>

      <Table.Root variant="surface" className="mt-3">
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
          {invoice!.items.map((item, index) => (
            <Table.Row key={index}>
              <Table.Cell>
                {/* <Link href={`/issues/${issue.id}`} childern={issue.title} /> */}
                {index + 1}
              </Table.Cell>
              <Table.Cell>
                <div>{item.description}</div>
                <Flex className="mt-1" align={"center"}>
                  <Badge className="mr-2" color="indigo">
                    Qty: {item.qty}
                  </Badge>
                  <Badge className="mr-2" color="indigo">
                    Rate: Rs.{item.rate}
                  </Badge>
                  <Badge color="green">Total: Rs.{item.amount}</Badge>
                </Flex>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>

      <Table.Root variant="surface" className="mt-3">
        <Table.Body>
          <TableRowCustom name="Subtotal" value={"Rs." + invoice!.subtotal} />
          <TableRowCustom name="Tax" value={"Rs." + invoice!.tax} />
          <TableRowCustom name="Discount" value={"Rs." + invoice!.discount} />
          <TableRowCustom name="Total" value={"Rs." + invoice!.total} />
        </Table.Body>
      </Table.Root>
    </div>
  );
};

export default DetailPage;
