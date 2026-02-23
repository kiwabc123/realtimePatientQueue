import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Patient Queue System",
  description: "Real-time patient and staff management system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
