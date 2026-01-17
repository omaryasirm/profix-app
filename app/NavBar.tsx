"use client";

import { Skeleton } from "@/app/components";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const NavBar = () => {
  const currentPath = usePathname();
  const { status, data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const links = [
    { label: "Dashboard", href: "/" },
    { label: "Invoices", href: "/invoices" },
    { label: "Estimates", href: "/estimates" },
    { label: "Customers", href: "/customers" },
    { label: "Items", href: "/items" },
  ];

  return (
    <nav className="border-b mb-5 px-4 sm:px-6 lg:px-8 h-14 flex items-center bg-background">
      <div className="container mx-auto flex items-center justify-between w-full">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center">
            <Image
              src="/profix_logo_crop.png"
              alt="Profix Logo"
              width={70}
              height={20}
              className="pt-1"
              priority={true}
            />
          </Link>
          {/* Desktop Navigation */}
          <ul className="hidden md:flex space-x-6">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    link.href === currentPath
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                  href={link.href}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Right side: User menu (desktop) or Mobile menu button */}
        <div className="flex items-center gap-2">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>

          {/* Desktop User Menu */}
          {status === "loading" && (
            <Skeleton className="hidden md:block h-8 w-8 rounded-full" />
          )}
          {status === "authenticated" && (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hidden md:flex h-8 w-8 rounded-full p-0">
                  <Image
                    src={session.user!.image || "/default-avatar.png"}
                    alt={session.user!.name || "User"}
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-full"
                    unoptimized={!session.user!.image?.startsWith("/")}
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {session.user!.name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session.user!.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {status === "unauthenticated" && (
            <Link href="/api/auth/signin" className="hidden md:inline">
              <Button variant="ghost">Login</Button>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-14 left-0 right-0 bg-background border-b shadow-lg z-50">
          <div className="px-4 py-2 space-y-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "block px-3 py-2 rounded-md text-base font-medium transition-colors",
                  link.href === currentPath
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t pt-2 mt-2">
              {status === "authenticated" ? (
                <div className="px-3 py-2">
                  <p className="text-sm font-medium">{session.user!.email}</p>
                  <Button
                    variant="ghost"
                    className="w-full justify-start mt-2"
                    onClick={() => {
                      signOut({ callbackUrl: "/" });
                      setMobileMenuOpen(false);
                    }}
                  >
                    Log out
                  </Button>
                </div>
              ) : (
                <Link href="/api/auth/signin" className="block px-3 py-2">
                  <Button variant="ghost" className="w-full justify-start">
                    Login
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
