import "./globals.css";
import type { Metadata } from "next";
import { inter } from "./fonts";
import NavBar from "./NavBar";
import AuthProvider from "./auth/Provider";
import { Providers } from "./providers";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

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
        <Providers>
          <AuthProvider>
            <NavBar />
            <main className="px-5 md:py-5 h-full pb-5">{children}</main>
          </AuthProvider>
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
