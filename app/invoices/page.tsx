import React, { Component } from "react";
import { Button, Table } from "@radix-ui/themes";
import Link from "next/link";
import prisma from "@/prisma/client";
import NextLink from "next/link";
import { Link as RadixLink } from "@radix-ui/themes";

const InvoicesPage = async () => {
  const invoices = await prisma.invoice.findMany();

  const getDate = (date: Date) => {
    return (
      date.getDate() +
        " " +
        date.toLocaleDateString("en-us", {
          month: "short",
          year: "numeric",
        }) ?? ""
    );
  };

  return (
    <div className="max-w-xl">
      <div className="mb-5">
        <Button>
          <Link href="/invoices/new">Create Invoice</Link>
        </Button>
      </div>
      <Table.Root variant="surface">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>Id</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Customer Name</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Issue Date</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {invoices.map((invoice) => (
            <Table.Row key={invoice.id}>
              <Table.Cell>{invoice.id}</Table.Cell>
              <Table.Cell>
                <NextLink
                  href={`/invoices/${invoice.id}`}
                  passHref
                  legacyBehavior
                >
                  <RadixLink>{invoice.name}</RadixLink>
                </NextLink>
              </Table.Cell>
              <Table.Cell>{getDate(invoice.createdAt)}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </div>
  );
};

export const dynamic = "force-dynamic";
export default InvoicesPage;
