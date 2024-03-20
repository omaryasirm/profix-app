"use client";

import { Skeleton } from "@/app/components";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";

import {
  Avatar,
  Box,
  Button,
  Container,
  DropdownMenu,
  Flex,
  Text,
} from "@radix-ui/themes";

const NavBar = () => {
  const currentPath = usePathname();
  const { status, data: session } = useSession();

  const links = [
    // { label: "Dahsboard", href: "/" },
    { label: "Invoices", href: "/invoices" },
    { label: "Estimates", href: "/estimates" },
  ];

  return (
    <nav className="border-b mb-5 px-5 h-14 flex items-center">
      <Container>
        <Flex justify={"between"}>
          <Flex align={"center"} gap={"3"}>
            <Image
              src="/profix_logo_crop.png"
              alt="/"
              width={70}
              height={20}
              style={{ paddingTop: "3px" }}
              priority={true}
            />
            <ul className="flex space-x-6">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    className={`${
                      link.href === currentPath && "text-zinc-900"
                    } text-zinc-500 hover:text-zinc-800 transition-colors`}
                    href={link.href}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </Flex>
          <Box>
            {status === "loading" && <Skeleton width="3rem" />}
            {status === "authenticated" && (
              <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                  <Avatar
                    src={session.user!.image!}
                    fallback="?"
                    size="2"
                    radius="full"
                    className="cursor-pointer"
                  />
                </DropdownMenu.Trigger>
                <DropdownMenu.Content>
                  <DropdownMenu.Label>
                    <Text size="2">{session.user!.email}</Text>
                  </DropdownMenu.Label>
                  <DropdownMenu.Item
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    <Text className="cursor-pointer">Log out</Text>
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            )}
            {status === "unauthenticated" && (
              <Link
                className="text-zinc-500 hover:text-zinc-800 transition-colors"
                href="/api/auth/signin"
              >
                Login
              </Link>
            )}
          </Box>
        </Flex>
      </Container>
    </nav>
  );
};

export default NavBar;
