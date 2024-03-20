"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@radix-ui/themes";
import ReactToPrint, { useReactToPrint } from "react-to-print";
import { Invoice } from "@prisma/client";
import axios from "axios";
import { Spinner } from "@/app/components";
import { useRouter } from "next/navigation";
// import Html2Pdf from "js-html2pdf";
import { AiOutlinePrinter } from "react-icons/ai";
import { MdOutlineFileDownload } from "react-icons/md";

interface Props {
  params: { id: string };
}

const RenderPage = ({ params }: Props) => {
  const myFontSize = "10px";
  const router = useRouter();
  const ref = useRef<HTMLDivElement>();

  const [isLoading, setIsLoading] = useState(true);

  const [invoice, setInvoice] = useState<Invoice>();

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

  const onBack = async () => {
    router.push("/invoices");
  };

  const getTax = () => {
    return (invoice?.tax * invoice?.subtotal) / 100;
  };

  const getDiscount = () => {
    return (invoice?.discount * invoice?.subtotal) / 100;
  };

  const getTotal = () => {
    return invoice?.subtotal + getTax() - getDiscount();
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

  const TableRow1 = (props) => {
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
  return isLoading ? (
    <Spinner />
  ) : (
    <div>
      <ReactToPrint
        bodyClass="print-agreement"
        content={() => ref.current}
        trigger={() => (
          <Button type="primary" style={{ padding: "10px 20px" }}>
            <AiOutlinePrinter size={"1.2rem"} />
            Print
          </Button>
        )}
      />
      <Button
        style={{ marginLeft: "7px" }}
        color="green"
        // onClick={handleDownload}
      >
        <MdOutlineFileDownload size={"1.2rem"} />
        Download
      </Button>
      <div style={{ display: "none" }}>
        <div
          ref={ref}
          id="element-to-download-as-pdf"
          style={{
            width: "200mm",
            height: "275mm",
            paddingTop: "220px",
            paddingLeft: "60px",
            paddingRight: "20px",
          }}
        >
          {/* <Button onClick={() => console.log("ran")}>Print Invoice</Button> */}

          <div className="flex">
            <table
              className="border w-10 border-gray-200 mr-10"
              style={{ width: "500px" }}
            >
              <tbody>
                <TableRow1
                  name="Invoice No."
                  value={"PROFIX-" + invoice?.id ?? ""}
                />
                <TableRow1
                  name="Invoice Date"
                  value={
                    new Date(invoice?.createdAt).getDate() +
                      " " +
                      new Date(invoice?.createdAt).toLocaleDateString("en-us", {
                        month: "long",
                        year: "numeric",
                      }) ?? ""
                  }
                />
                {/* 9 March, 2024 */}
                <TableRow1
                  name="Payment Method"
                  value={invoice?.paymentMethod ?? ""}
                />
                <TableRow1
                  name="Payment Account"
                  value={invoice?.paymentAccount ?? ""}
                />
              </tbody>
            </table>

            <table
              className="border w-10 border-gray-200"
              style={{ width: "500px" }}
            >
              <tbody>
                <TableRow1 name="Customer Name" value={invoice?.name ?? ""} />
                <TableRow1 name="Address" value={invoice?.address ?? ""} />
                <TableRow1 name="Contact" value={invoice?.contact ?? ""} />
                <TableRow1 name="Vehicle" value={invoice?.vehicle ?? ""} />
              </tbody>
            </table>
          </div>

          <table
            className=" w-10 border-gray-200 mt-10"
            style={{ width: "100%" }}
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
              {invoice?.items.map((item, index) => (
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
                  Rs. {getTax() ?? "0.00"}
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
                  Rs. {getDiscount()}
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
                  Rs. {getTotal()}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="text-left mt-16 text-sm">
            <p className="font-bold mb-5">Terms and Conditions</p>
            <p>
              Terms and conditions are a set of guidelines that specify the
              rules and obligations for using a service or product. They outline
              the rights and responsibilities of both the provider and the user,
              covering aspects such as usage limitations, payment terms, and
              dispute resolution. By agreeing to the terms and conditions, users
              acknowledge and accept these terms as binding.
            </p>
          </div>

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
