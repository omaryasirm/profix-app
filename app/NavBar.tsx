"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { TbFileInvoice } from "react-icons/tb";

const NavBar = () => {
  const currentPath = usePathname();

  const links = [
    { label: "Dahsboard", href: "/" },
    { label: "Invoices", href: "/invoices" },
  ];

  return (
    <nav className="flex space-x-6 border-b mb-5 px-5 h-14 items-center">
      <Link href="/">
        <TbFileInvoice />
      </Link>
      <ul className="flex space-x-6">
        {links.map((link) => (
          <Link
            key={link.href}
            className={`${
              link.href === currentPath && "text-zinc-900"
            } text-zinc-500 hover:text-zinc-800 transition-colors`}
            href={link.href}
          >
            {link.label}
          </Link>
        ))}
      </ul>
    </nav>
  );
};

export default NavBar;