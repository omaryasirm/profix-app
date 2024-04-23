import "@radix-ui/themes/styles.css";
import "./theme-config.css";
import "./globals.css";
import type { Metadata } from "next";
import { inter } from "./fonts";
import { Theme } from "@radix-ui/themes";
import NavBar from "./NavBar";
import AuthProvider from "./auth/Provider";

export const metadata: Metadata = {
  title: "Profix Invoice",
  description: "Profix Invoice App",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>
        <AuthProvider>
          <Theme accentColor="indigo" className="h-full">
            <NavBar />
            <main className="p-5 h-full">{children}</main>
          </Theme>
        </AuthProvider>
      </body>
    </html>
  );
}
