"use client";

import { Spinner } from "@/app/components";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { Badge, Button, Flex, IconButton, Link, Table } from "@radix-ui/themes";
import { Prisma } from "@prisma/client";
import { useRouter } from "next/navigation";
import RenderInvoicePage from "./render/page";
import { FaWhatsappSquare } from "react-icons/fa";

const InvoiceDetailPage = ({ params }: { params: { id: string } }) => {
  const invoiceWithItems = Prisma.validator<Prisma.InvoiceDefaultArgs>()({
    include: { items: true },
  });
  type invoiceWithItems = Prisma.InvoiceGetPayload<typeof invoiceWithItems>;

  const [invoice, setInvoice] = useState<invoiceWithItems>();
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

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

  const TableRowCustom = (props: { name: string; value: any }) => {
    return (
      <Table.Row>
        <Table.Cell className="font-bold w-40">{props.name}</Table.Cell>
        <Table.Cell className="flex">
          {props.name == "Contact" ? (
            <>
              <Link href="https://wa.me/03341724932"> {props.value}</Link>
              <button className="ml-2 flex items-center">
                <Link href="https://wa.me/03341724932">
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
  // <Button>
  //   <Link href="/invoices/new">Create Invoice</Link>
  // </Button>;
  // https://wa.me/03341724932

  return isLoading ? (
    <Spinner fullPage={true} />
  ) : (
    <div className="max-w-xl pb-10">
      <Flex className="mb-3">
        <Button
          variant="outline"
          style={{ marginRight: "7px" }}
          onClick={() => router.push(`/invoices/${params.id}/edit`)}
        >
          Edit Invoice
        </Button>
        <RenderInvoicePage params={params} />
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

export default InvoiceDetailPage;
