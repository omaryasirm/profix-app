import React, { Component } from "react";
import { Button, Flex, Heading, Table } from "@radix-ui/themes";
import Link from "next/link";
import prisma from "@/prisma/client";
import NextLink from "next/link";
import { Link as RadixLink } from "@radix-ui/themes";
import { Invoice } from "@prisma/client";

interface Props {
  invoices?: Invoice[];
  estimates?: Invoice[];
}

const TablePage = async ({ invoices, estimates }: Props) => {
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
      <Flex justify={"between"} className="mb-5">
        <Heading>{invoices ? "Invoices" : "Estimates"}</Heading>
        <Button>
          <Link href={invoices ? "/invoices/new" : "/estimates/new"}>
            {invoices ? "Create Invoice" : "Create Estimate"}
          </Link>
        </Button>
      </Flex>
      <Table.Root variant="surface">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>Id</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Customer Name</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Issue Date</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {(invoices ?? estimates!).map((invoice) => (
            <Table.Row key={invoice.id}>
              <Table.Cell>{invoice.id}</Table.Cell>
              <Table.Cell>
                <NextLink
                  href={
                    invoices
                      ? `/invoices/${invoice.id}`
                      : `/estimates/${invoice.id}`
                  }
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
export default TablePage;
