import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "@/components/providers";

const geist = localFont({ src: "./fonts/GeistVF.woff", variable: "--font-sans" });
const geistMono = localFont({ src: "./fonts/GeistMonoVF.woff", variable: "--font-mono" });

export const metadata: Metadata = {
  title: "ShipLock",
  description: "Client delivery protection for dev studios",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn(geist.variable, geistMono.variable)} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
