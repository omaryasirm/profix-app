"use client";

import { Spinner } from "@/app/components";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { Badge, Button, Flex, Link, Table, Text } from "@radix-ui/themes";
import { Prisma } from "@prisma/client";
import { useRouter } from "next/navigation";
import RenderInvoicePage from "./render/page";

const InvoiceDetailPage = ({ params }: { params: { id: string } }) => {
  const invoiceWithItems = Prisma.validator<Prisma.InvoiceDefaultArgs>()({
    include: { items: true },
  });
  type invoiceWithItems = Prisma.InvoiceGetPayload<typeof invoiceWithItems>;

  const [invoice, setInvoice] = useState<invoiceWithItems>();
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (invoice == null) {
      getInvoice();
    }
  }, []);

  const getInvoice = async () => {
    let res = await axios.get(`/api/invoices/${params.id}`);
    setInvoice(res.data);
    console.log(res.data);
    setIsLoading(false);
  };
  const myFontSize = "12px";

  const TableRow1 = (props) => {
    return (
      <tr>
        <td
          className="px-1 text-left font-bold border border-gray-300"
          style={{ fontSize: myFontSize, width: "100px" }}
        >
          {props.name}
        </td>
        <td
          className="py-0.5 px-2 text-left border-b border border-gray-300"
          style={{ fontSize: myFontSize }}
        >
          {" "}
          {props.value}
        </td>
      </tr>
    );
  };

  const TableRowCustom = (props: { name: string; value: any }) => {
    return (
      <Table.Row>
        <Table.Cell className="font-bold w-40">{props.name}</Table.Cell>
        <Table.Cell>{props.value}</Table.Cell>
      </Table.Row>
    );
  };

  return isLoading ? (
    <Spinner />
  ) : (
    <div className="max-w-xl">
      <Flex className="mb-3">
        <Button
          type="primary"
          variant="outline"
          style={{ marginRight: "7px" }}
          onClick={() => router.push(`/invoices/${params.id}/edit`)}
        >
          Edit Invoice
        </Button>
        {/* <ReactToPrint
          bodyClass="print-agreement"
          content={() => ref.current}
          trigger={() => (
            <Button type="primary" style={{ padding: "10px 20px" }}>
              🖨️ Print
            </Button>
          )}
        /> */}
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
          <TableRowCustom name="Address" value={invoice!.address} />
          <TableRowCustom name="Contact" value={invoice!.contact} />
          <TableRowCustom name="Vehicle" value={invoice!.vehicle} />
          <TableRowCustom
            name="Payment Method"
            value={invoice?.paymentMethod ?? ""}
          />
          <TableRowCustom
            name="Payment Account"
            value={invoice?.paymentAccount ?? ""}
          />
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
