import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ReturnIQ — AI-Powered Smart Returns",
  description:
    "Reduce refund losses, detect fraud risk, and recommend exchanges automatically with AI-powered return management.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
