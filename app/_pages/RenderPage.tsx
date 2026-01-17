"use client";

import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import ReactToPrint from "react-to-print";
import { Printer } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useInvoice } from "@/hooks/api/useInvoices";
import { formatDateLongPakistan, formatDateTimePakistan } from "@/lib/date-utils";

interface Props {
  params: { id: string };
  display?: boolean;
}

const RenderPage = ({ params, display }: Props) => {
  const myFontSize = "10px";
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  const { data: invoice, isLoading } = useInvoice(params.id);

  const onBack = async () => {
    router.push("/invoices");
  };

  const getTax = () => {
    if (!invoice?.tax || !invoice?.subtotal) return 0;
    return (invoice.tax * invoice.subtotal) / 100;
  };

  const getDiscount = () => {
    if (!invoice?.discount || !invoice?.subtotal) return 0;
    return (invoice.discount * invoice.subtotal) / 100;
  };

  const getTotal = () => {
    const subtotal = invoice?.subtotal ?? 0;
    return subtotal + getTax() - getDiscount();
  };

  // const handleDownload = useReactToPrint({
  //   onPrintError: (error) => console.log(error),
  //   content: () => ref.current,
  //   removeAfterPrint: true,
  //   print: async (printIframe) => {
  //     const document = printIframe.contentDocument;
  //     if (document) {
  //       const html = document.getElementById("element-to-download-as-pdf");
  //       console.log(html);
  //       const exporter = new Html2Pdf(html, {
  //         filename: `invoice-${params.id}.pdf`,
  //       });
  //       exporter.getPdf(true);
  //     }
  //   },
  // });

  const TableRow1 = (props: { name: string; value: string | number }) => {
    return (
      <tr>
        <td
          className="px-1 text-left bg-gray-100 text-xs font-bold"
          style={{ fontSize: myFontSize, width: "100px" }}
        >
          {props.name}
        </td>
        <td
          className="py-0.5 px-1 text-center  border-b border-dashed border-gray-300 text-sm"
          style={{ fontSize: myFontSize }}
        >
          {" "}
          {props.value}
        </td>
      </tr>
    );
  };
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="mx-auto bg-white" style={{ width: "200mm", minHeight: "275mm", padding: "80px 60px 20px 20px" }}>
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-8" />
          <Skeleton className="h-32 w-full mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center text-destructive">Invoice not found.</div>
      </div>
    );
  }

  return (
    <div className="">
      <div className="mb-4">
        <ReactToPrint
          bodyClass="print-agreement"
          content={() => ref.current!}
          trigger={() => (
            <Button className="print:hidden">
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
          )}
        />
        {/* <Button
          style={{ marginLeft: "7px" }}
          color="green"
          // onClick={handleDownload}
        >
          <MdOutlineFileDownload size={"1.2rem"} />
          Download
        </Button> */}
      </div>

      <div style={{ display: display ? "inherit" : "none" }}>
        <div
          ref={ref}
          id="element-to-download-as-pdf"
          className="mx-auto bg-white"
          style={{
            width: "200mm",
            minHeight: "275mm",
            paddingTop: "80px",
            paddingLeft: "60px",
            paddingRight: "20px",
          }}
        >
          <style>{}</style>
          {/* <Button onClick={() => console.log("ran")}>Print Invoice</Button> */}
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <Image
              src="/profix_logo_crop.png"
              alt="/"
              width={200}
              height={20}
              className="mb-4 sm:mb-8"
              priority={true}
            />
            <div className="text-xs flex flex-col text-left sm:text-right space-y-0.5">
              <span className="font-semibold">E5-C, Street no 2</span>
              <span>Sadaat Town, Bedian Road</span>
              <span>Cantt, Lahore</span>
              <span className="mt-1 text-gray-600">0323 4374566</span>
              <span className="text-gray-600">profixgarage.pk@gmail.com</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row mt-10 gap-4">
            <table
              className="border border-gray-200"
              style={{ width: "100%", maxWidth: "500px" }}
            >
              <tbody>
                <TableRow1
                  name="Invoice No."
                  value={invoice?.id ? `PROFIX-${invoice.id}` : ""}
                />
                <TableRow1
                  name="Invoice Date"
                  value={formatDateTimePakistan(invoice?.createdAt)}
                />
                {/* 9 March, 2024 */}
                <TableRow1
                  name="Payment Method"
                  value={invoice?.paymentMethod ?? ""}
                />
                <TableRow1
                  name="Payment Account"
                  value={
                    !invoice?.paymentAccount || invoice.paymentAccount === ""
                      ? "None"
                      : invoice.paymentAccount
                  }
                />
              </tbody>
            </table>

            <table
              className="border border-gray-200"
              style={{ width: "100%", maxWidth: "500px" }}
            >
              <tbody>
                <TableRow1 name="Customer Name" value={invoice?.name ?? ""} />
                <TableRow1 name="Contact" value={invoice?.contact ?? ""} />
                <TableRow1 name="Vehicle" value={invoice?.vehicle ?? ""} />
                <TableRow1
                  name="Registration No"
                  value={invoice?.registrationNo ?? ""}
                />
              </tbody>
            </table>
          </div>

          <div className="overflow-x-auto mt-10">
            <table
              className="border border-gray-200"
              style={{ width: "100%", minWidth: "600px" }}
            >
            <thead>
              <tr>
                <td
                  className="py-0.5 text-center bg-gray-100 text-xs font-bold border"
                  style={{ width: "30px", fontSize: myFontSize }}
                >
                  Id
                </td>
                <td
                  className="py-0.5 text-center bg-gray-100 text-xs font-bold border"
                  style={{ fontSize: myFontSize }}
                >
                  Description
                </td>
                <td
                  className="py-0.5 text-center bg-gray-100 text-xs font-bold border"
                  style={{ width: "100px", fontSize: myFontSize }}
                >
                  Qty
                </td>
                <td
                  className="py-0.5 text-center bg-gray-100 text-xs font-bold border"
                  style={{ width: "100px", fontSize: myFontSize }}
                >
                  Rate
                </td>
                <td
                  className="py-0.5 text-center bg-gray-100 text-xs font-bold border"
                  style={{ width: "100px", fontSize: myFontSize }}
                >
                  Amount
                </td>
              </tr>
            </thead>
            <tbody>
              {invoice?.items?.map((item: { description: string; qty: number; rate: number; amount: number }, index: number) => (
                <tr key={index}>
                  <td
                    className="py-0.5 text-center text-xs border"
                    style={{ fontSize: myFontSize }}
                  >
                    {index + 1}
                  </td>
                  <td
                    className="py-0.5 pl-3 text-left text-xs border"
                    style={{ fontSize: myFontSize }}
                  >
                    {item.description}
                  </td>
                  <td
                    className="py-0.5 text-center text-xs border"
                    style={{ fontSize: myFontSize }}
                  >
                    {item.qty}
                  </td>
                  <td
                    className="py-0.5 text-center text-xs border"
                    style={{ fontSize: myFontSize }}
                  >
                    Rs.{item.rate}
                  </td>
                  <td
                    className="py-0.5 text-center text-xs border"
                    style={{ fontSize: myFontSize }}
                  >
                    Rs.{item.amount}
                  </td>
                </tr>
              ))}
              {/* total */}
              <tr>
                <td className="py-0.5 text-center text-xs "></td>
                <td className="py-0.5 text-center text-xs "></td>
                <td
                  className="py-0.5 text-right px-1 font-bold text-xs border border-r-0"
                  style={{ fontSize: myFontSize }}
                >
                  Subtotal
                </td>
                <td className="py-0.5 text-center text-xs"></td>
                <td
                  className="py-0.5 text-center text-xs font-bold border"
                  style={{ fontSize: myFontSize }}
                >
                  Rs. {invoice?.subtotal ?? "0"}
                </td>
              </tr>
              <tr>
                <td className="py-0.5 text-center text-xs "></td>
                <td className="py-0.5 text-center text-xs "></td>
                <td
                  className="py-0.5 text-right px-1 font-bold text-xs border"
                  style={{ fontSize: myFontSize }}
                >
                  Tax
                </td>
                <td
                  className="py-0.5 text-center text-xs font-bold border"
                  style={{ fontSize: myFontSize }}
                >
                  {invoice?.tax ?? "0.00"}%
                </td>
                <td
                  className="py-0.5 text-center text-xs font-bold border"
                  style={{ fontSize: myFontSize }}
                >
                  Rs. {getTax().toFixed(2)}
                </td>
              </tr>
              <tr>
                <td className="py-0.5 text-center text-xs"></td>
                <td className="py-0.5 text-center text-xs"></td>
                <td
                  className="py-0.5 text-right px-1 font-bold text-xs border"
                  style={{ fontSize: myFontSize }}
                >
                  Discount
                </td>
                <td
                  className="py-0.5 text-center font-bold text-xs border"
                  style={{ fontSize: myFontSize }}
                >
                  {invoice?.discount ?? "0.00"}%
                </td>
                <td
                  className="py-0.5 text-center font-bold text-xs border"
                  style={{ fontSize: myFontSize }}
                >
                  Rs. {getDiscount().toFixed(2)}
                </td>
              </tr>
              <tr>
                <td className="py-0.5 text-center text-xs"></td>
                <td className="py-0.5 text-center text-xs "></td>
                <td
                  className="py-0.5 text-right px-1 font-bold text-xs border border-r-0 bg-gray-100"
                  style={{ fontSize: myFontSize }}
                >
                  Total
                </td>
                <td className="py-0.5 text-center text-xs font-bold border-b bg-gray-100"></td>
                <td
                  className="py-0.5 text-center text-xs font-bold border bg-gray-100"
                  style={{ fontSize: myFontSize }}
                >
                  Rs. {getTotal().toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
          </div>

          {/* <div className="text-left mt-16 text-sm">
            <p className="font-bold mb-5 text-sm">Terms and Conditions</p>
            <p className="text-justify text-xs">
              Terms and conditions are a set of guidelines that specify the
              rules and obligations for using a service or product. They outline
              the rights and responsibilities of both the provider and the user,
              covering aspects such as usage limitations, payment terms, and
              dispute resolution. By agreeing to the terms and conditions, users
              acknowledge and accept these terms as binding.
            </p>
          </div> */}

          <div className="text-center mt-16 font-bold">
            <span>Thank you for choosing our services!</span>
          </div>

          {/* {obj.map((item, index) => (
        <div key={item.id}>
          <p>
            {index + 1}: {item.name}
          </p>
        </div>
      ))} */}
        </div>
      </div>
    </div>
  );
};

export default RenderPage;
