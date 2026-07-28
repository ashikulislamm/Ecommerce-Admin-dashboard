import type { Metadata } from "next";
import type { ReactNode } from "react";
import QueryProvider from "@/components/providers/QueryProvider";

import "./globals.css";

export const metadata: Metadata = {
  title: "Ecommerce Admin Dashboard",
  description: "Administrative dashboard scaffold for the ecommerce platform.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}