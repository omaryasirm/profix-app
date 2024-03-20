"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const NavBar = () => {
  const currentPath = usePathname();

  const links = [
    // { label: "Dahsboard", href: "/" },
    { label: "Invoices", href: "/invoices" },
    { label: "Estimates", href: "/estimates" },
  ];

  return (
    <nav className="flex space-x-6 border-b mb-5 px-5 h-14 items-center">
      <Image
        src="/profix_logo_crop.png"
        alt="/"
        width={70}
        height={20}
        style={{ paddingTop: "7px" }}
        priority={true}
      />
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
