import React, { Component } from "react";
import { Button } from "@radix-ui/themes";
import Link from "next/link";

const InvoicesPage = async () => {
  return (
    <div>
      <div className="mb-5">
        <Button>
          <Link href="/invoices/new">Create Invoice</Link>
        </Button>
      </div>
    </div>
  );
};

export default InvoicesPage;
